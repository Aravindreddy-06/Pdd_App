import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Eye, EyeOff, CheckCircle, XCircle, Loader, Mail, Lock, ShieldCheck
} from 'lucide-react';
import Logo from '../components/Logo';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ResourceShareadmin@gmail.com').toLowerCase().trim();

const ContactStatusIcon = ({ contactStatus }) => {
  if (contactStatus === 'checking') return <Loader size={18} className="input-status-icon spinning" />;
  if (contactStatus === 'valid')    return <CheckCircle size={18} className="input-status-icon valid" />;
  if (contactStatus === 'invalid')  return <XCircle size={18} className="input-status-icon invalid" />;
  return null;
};

async function domainHasMX(domain) {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { Accept: 'application/dns-json' } }
    );
    if (!res.ok) return false;
    const json = await res.json();
    return json.Status === 0 && Array.isArray(json.Answer) && json.Answer.length > 0;
  } catch {
    return false;
  }
}

function looksLikePhone(value) {
  return /^[+\d]/.test(value.trim()) && !value.includes('@');
}

export default function SignUp() {
  const navigate = useNavigate();
  const { requestLocation } = useUser();
  
  // Toggle mode right on this page: 'signup' vs 'login'
  const [authMode, setAuthMode] = useState('signup');

  const [formData, setFormData]     = useState({ name: '', contact: '', password: '', confirmPassword: '' });
  const [loginContact, setLoginContact] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPw]   = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed]         = useState(false);

  const [contactStatus, setContactStatus] = useState('idle');
  const [contactError,  setContactError]  = useState('');
  
  const [stage, setStage] = useState('details');
  const [nameError, setNameError] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [confirmPwError, setConfirmPwError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  const validateContact = useCallback(async (value) => {
    const v = value.trim();
    if (!v) { setContactStatus('idle'); setContactError(''); return; }

    if (looksLikePhone(v)) {
      const parsed = parsePhoneNumberFromString(v);
      if (parsed?.isValid()) {
        setContactStatus('valid'); setContactError('');
      } else {
        setContactStatus('invalid'); setContactError('Enter a valid mobile phone number with country code');
      }
      return;
    }

    if (!EMAIL_REGEX.test(v)) {
      setContactStatus('invalid'); setContactError('Invalid email format (e.g. name@domain.com)');
      return;
    }

    setContactStatus('checking'); setContactError('');
    const domain = v.split('@')[1];
    const mxOk = await domainHasMX(domain);
    if (mxOk) {
      setContactStatus('valid'); setContactError('');
    } else {
      setContactStatus('invalid'); setContactError(`Domain "@${domain}" cannot receive emails`);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');

    if (name === 'name') {
      setNameError(value.trim().length >= 2 ? '' : 'Name must be at least 2 characters');
    }
    if (name === 'contact') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => validateContact(value), 500);
    }
    if (name === 'password') {
      setPwError(value.length >= 8 ? '' : 'Password must be at least 8 characters');
    }
    if (name === 'confirmPassword') {
      setConfirmPwError(value === formData.password ? '' : 'Passwords do not match');
    }
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) { setNameError('Please enter your full name'); return; }
    if (contactStatus !== 'valid') { setContactError('Please fix contact errors first'); return; }
    setStage('password');
  };

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function callApi(endpoint, payload) {
    const isCapacitor = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.protocol === 'capacitor:' || 
      window.location.protocol === 'file:'
    );

    const candidateUrls = [];
    if (isCapacitor) {
      if (import.meta.env.VITE_API_BASE_URL) {
        candidateUrls.push(`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}${endpoint}`);
      }
      candidateUrls.push(`https://resource-sharing.vercel.app${endpoint}`);
      candidateUrls.push(`http://127.0.0.1:5173${endpoint}`);
      candidateUrls.push(`http://10.133.54.232:5173${endpoint}`);
    } else {
      candidateUrls.push(endpoint);
    }

    const fetchWithTimeout = (url) => new Promise(async (resolve, reject) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timer);
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          return resolve(data);
        }
        reject(new Error('Non-JSON response'));
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });

    try {
      return await Promise.any(candidateUrls.map(url => fetchWithTimeout(url)));
    } catch (err) {
      throw new Error('OTP backend API is unreachable. Please check your internet connection or dev server.');
    }
  }

  // Step 1 -> Step 2 -> Request OTP -> Step 3 (OTP verification)
  const handleInitiateSignUp = async (e) => {
    e.preventDefault();
    
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(formData.password);
    
    if (formData.password.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (!hasNumber || !hasSpecial) { setPwError('Include a number and special character'); return; }
    if (formData.password !== formData.confirmPassword) { setConfirmPwError('Passwords do not match'); return; }

    setLoading(true);
    setSubmitError('');

    try {
      // Send OTP to user's email via Gmail SMTP backend
      const data = await callApi('/api/send-otp', { email: formData.contact.trim(), purpose: 'signup' });

      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP code');
      }

      setStage('otp');
      setResendCooldown(60);
      setOtpError('');
    } catch (err) {
      setSubmitError('OTP Sending failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignUpOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setOtpError('');
    try {
      const data = await callApi('/api/send-otp', { email: formData.contact.trim(), purpose: 'signup' });
      if (!data.success) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      setResendCooldown(60);
      setOtpError('');
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Registration Handler after OTP Verified ──────────────────────
  const handleVerifyAndSignUp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError('Please enter the full 6-digit OTP');
      return;
    }

    setLoading(true);
    setOtpError('');

    localStorage.removeItem('rs_profile');
    localStorage.removeItem('rs_wishlist');
    localStorage.removeItem('rs_cart');
    localStorage.removeItem('resource_share_items');

    try {
      // 1. Verify OTP
      const verifyData = await callApi('/api/verify-otp', { email: formData.contact.trim(), otp: otpCode.trim(), purpose: 'signup' });

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Invalid OTP code');
      }

      // 2. Complete Supabase Auth Sign Up
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: formData.contact.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim()
          }
        }
      });
      
      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
          setSubmitError('An account with this email already exists. Please log in below.');
          setAuthMode('login');
          setLoginContact(formData.contact.trim());
          return;
        }
        throw error;
      }

      if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setSubmitError('An account with this email already exists. Please log in below.');
        setAuthMode('login');
        setLoginContact(formData.contact.trim());
        return;
      }

      await requestLocation();
      navigate('/home');
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Direct Login Handler ─────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginContact.trim() || !loginPassword) return;

    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginContact.trim(),
        password: loginPassword
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setSubmitError('Invalid credentials or account does not exist. Please check your email or create a new account.');
        } else {
          throw error;
        }
        return;
      }

      await requestLocation();
      const loggedEmail = loginContact.trim().toLowerCase();
      navigate(loggedEmail === ADMIN_EMAIL ? '/admin' : '/home', { replace: true });
    } catch (err) {
      setSubmitError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const redirectUrl = `${window.location.origin}/home`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (err) {
      setSubmitError('Google sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* ── Left Visual Panel ── */}
      <div className="auth-visual-side">
        <div className="auth-visual-bg"></div>
        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-logo">
            <Logo size={36} />
            <span>Lendkart</span>
          </Link>
          <h1 className="auth-visual-headline">
            Share more,<br />
            Own less.
          </h1>
          <p className="auth-visual-sub">
            Build a more sustainable and connected community together through 
            shared resources.
          </p>
        </div>
        <div className="auth-visual-footer">
          © 2026 Lendkart. All rights reserved.
        </div>
      </div>

      {/* ── Right Auth Form Panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-container">

          {/* ── MODE 1: CREATE ACCOUNT ── */}
          {authMode === 'signup' && (
            <>
              <header style={{ marginBottom: '32px' }}>
                <h1 className="auth-title-large">Create account</h1>
                <p className="auth-subtitle-large">Start sharing with your neighbors today.</p>
              </header>

              {stage === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="animate-in">
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
                    <div className={`input-wrapper ${nameError ? 'input-error' : ''}`}>
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    {nameError && <p className="field-error" style={{ marginTop: '8px' }}>{nameError}</p>}
                  </div>

                  <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                    <div className={`input-wrapper ${contactError ? 'input-error' : ''}`}>
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="name@example.com"
                        required
                      />
                      <ContactStatusIcon contactStatus={contactStatus} />
                    </div>
                    {contactError && <p className="field-error" style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>{contactError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-website"
                    disabled={formData.name.trim().length < 2 || contactStatus !== 'valid' || loading}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}
                  >
                    Continue
                  </button>
                </form>
              )}

              {stage === 'password' && (
                <form onSubmit={handleInitiateSignUp} className="animate-in">
                  <div className="text-center mb-6">
                    <div className="icon-container-light-green" style={{ margin: '0 auto 16px' }}>
                      <ShieldCheck size={24} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Secure your account</h2>
                    <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '8px' }}>
                      Choose a strong password to continue to verification.
                    </p>
                  </div>

                  <div className="form-group mb-6">
                    <label>Create Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="At least 8 characters"
                        required
                      />
                      <button type="button" className="btn-icon" onClick={() => setShowPw(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {pwError && <p className="field-error" style={{ marginTop: '8px' }}>{pwError}</p>}
                  </div>

                  <div className="form-group mb-6">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Repeat your password"
                        required
                      />
                      <button type="button" className="btn-icon" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                        {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPwError && <p className="field-error" style={{ marginTop: '8px' }}>{confirmPwError}</p>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={agreed} 
                      onChange={(e) => setAgreed(e.target.checked)} 
                      style={{ marginTop: '4px', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: '14px', color: 'var(--text-gray)', lineHeight: '1.4', cursor: 'pointer' }}>
                      I agree to the <Link to="/terms" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link> and 
                      <Link to="/terms" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>Privacy Policy</Link>.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-website"
                    disabled={!agreed || formData.password.length < 8 || loading}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}
                  >
                    {loading ? <><Loader size={18} className="spinning" /> Sending OTP...</> : 'Send Verification OTP'}
                  </button>

                  <button 
                    type="button" 
                    className="btn-link w-full mt-4" 
                    onClick={() => setStage('details')}
                    style={{ fontSize: '14px', color: 'var(--text-gray)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px' }}
                  >
                    Go back
                  </button>
                </form>
              )}

              {/* ── STAGE 3: OTP VERIFICATION ── */}
              {stage === 'otp' && (
                <form onSubmit={handleVerifyAndSignUp} className="animate-in">
                  <div className="text-center mb-6">
                    <div className="icon-container-light-green" style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={28} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Enter Verification Code</h2>
                    <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>
                      We have sent a 6-digit OTP to<br />
                      <strong style={{ color: '#ffffff' }}>{formData.contact}</strong>
                    </p>
                  </div>

                  <div className="form-group mb-6">
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>ENTER 6-DIGIT OTP</label>
                    <div className="input-wrapper" style={{ justifyContent: 'center' }}>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setOtpCode(val);
                          setOtpError('');
                        }}
                        className="input-field"
                        placeholder="123456"
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold', width: '100%', padding: '12px' }}
                        autoFocus
                        required
                      />
                    </div>
                    {otpError && <p className="field-error" style={{ marginTop: '8px', color: '#ef4444', textAlign: 'center' }}>{otpError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-website"
                    disabled={otpCode.length < 6 || loading}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}
                  >
                    {loading ? <><Loader size={18} className="spinning" /> Verifying OTP...</> : 'Verify & Create Account'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={handleResendSignUpOtp}
                      disabled={resendCooldown > 0 || loading}
                      style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#9ca3af' : '#4ade80', fontSize: '14px', fontWeight: 600, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setStage('password')}
                      style={{ fontSize: '14px', color: 'var(--text-gray)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Change password
                    </button>
                  </div>
                </form>
              )}
            </>
          )}


          {/* ── MODE 2: SIGN IN / LOG IN ── */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="animate-in">
              <header style={{ marginBottom: '32px' }}>
                <h1 className="auth-title-large">Welcome back</h1>
                <p className="auth-subtitle-large">Please log in to your Lendkart account to continue.</p>
              </header>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={loginContact}
                    onChange={(e) => { setLoginContact(e.target.value); setSubmitError(''); }}
                    className="input-field"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', margin: 0 }}>PASSWORD</label>
                  <Link to="/forgot-password" style={{ fontSize: '13px', color: '#4ade80', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setSubmitError(''); }}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" className="btn-icon" onClick={() => setShowPw(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!loginContact.trim() || !loginPassword || loading}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}
              >
                {loading ? <><Loader size={18} className="spinning" /> Signing in...</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Submit Error Banner ── */}
          {submitError && (
            <div style={{ padding: '14px', marginTop: '20px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px', fontSize: '14px', border: '1px solid #fee2e2' }}>
              {submitError}
            </div>
          )}

          <div className="divider" style={{ margin: '24px 0', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>OR</div>

          {/* ── Google Sign In Button ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              className="btn-google-website"
              onClick={handleGoogle}
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="" width={18} />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* ── In-page Mode Toggle Switch ── */}
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-gray)' }}>
            {authMode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('login'); setSubmitError(''); }}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#4ade80', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('signup'); setSubmitError(''); }}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#4ade80', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}
                >
                  Create account
                </button>
              </>
            )}
          </p>

          {/* ── Admin Portal ── */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              to="/admin/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: '#64748b', textDecoration: 'none',
                padding: '8px 16px', borderRadius: '20px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
            >
              🛡️ Admin Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
