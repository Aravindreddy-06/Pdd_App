import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Eye, EyeOff, CheckCircle, XCircle, Loader, Mail, Lock, ShieldCheck, ArrowRight
} from 'lucide-react';
import Logo from '../components/Logo';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

// ─── helpers ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ── status icon component ──────────────────────────────────────────────────
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

// ─── component ──────────────────────────────────────────────────────────────

export default function SignUp() {
  const navigate = useNavigate();
  const { updateUser, requestLocation } = useUser();
  
  const handleGoToSignIn = () => {
    const lastLogin = localStorage.getItem('rs_last_login');
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    
    if (lastLogin) {
      const timeSinceLogin = Date.now() - parseInt(lastLogin);
      if (timeSinceLogin < TWO_DAYS_MS) {
        navigate('/home');
        return;
      }
    }
    navigate('/login');
  };

  const [formData, setFormData]     = useState({ name: '', contact: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPw]   = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed]         = useState(false);

  // contact validation
  const [contactStatus, setContactStatus] = useState('idle'); // idle|checking|valid|invalid
  const [contactError,  setContactError]  = useState('');
  const [contactIsPhone, setContactIsPhone] = useState(false);

  // Flow stages: 'details' | 'otp' | 'password' | 'success'
  const [stage, setStage] = useState('details');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // field errors
  const [nameError, setNameError] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [confirmPwError, setConfirmPwError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  // ── contact validator ──────────────────────────────────────────────────────
  const validateContact = useCallback(async (value) => {
    const v = value.trim();
    if (!v) { setContactStatus('idle'); setContactError(''); return; }

    if (looksLikePhone(v)) {
      setContactIsPhone(true);
      const parsed = parsePhoneNumberFromString(v);
      if (parsed?.isValid()) {
        setContactStatus('valid'); setContactError('');
      } else {
        setContactStatus('invalid');
        setContactError('Enter a valid phone number with country code (e.g. +91 98765 43210)');
      }
      return;
    }

    setContactIsPhone(false);
    if (!EMAIL_REGEX.test(v)) {
      setContactStatus('invalid'); setContactError('Enter a valid email address'); return;
    }

    const domain = v.split('@')[1];
    setContactStatus('checking'); setContactError('');
    const hasMX = await domainHasMX(domain);
    if (hasMX) {
      setContactStatus('valid'); setContactError('');
    } else {
      setContactStatus('invalid');
      setContactError(`"${domain}" doesn't appear to be a real email domain`);
    }
  }, []);

  // ── change handler ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setSubmitError('');

    if (name === 'contact') {
      setContactStatus('idle');
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => validateContact(value), 600);
    }
    if (name === 'name') {
      setNameError(value.trim().length < 2 ? 'Please enter your name' : '');
    }
    if (name === 'password') {
      if (value.length > 0 && value.length < 8) {
        setPwError('Password must be at least 8 characters');
      } else if (value.length >= 8 && !/\d/.test(value)) {
        setPwError('Password must include at least one number');
      } else if (value.length >= 8 && !/[!@#$%^&*(),.?":{}|<>_]/.test(value)) {
        setPwError('Password must include at least one special character');
      } else {
        setPwError('');
      }
      // Re-validate confirm password if it already has value
      if (formData.confirmPassword) {
        setConfirmPwError(value !== formData.confirmPassword ? 'Passwords do not match' : '');
      }
    }
    if (name === 'confirmPassword') {
      setConfirmPwError(value !== formData.password ? 'Passwords do not match' : '');
    }
  };

  const handlePhoneChange = (value) => {
    // If the user clears the input, reset contact to empty
    const newValue = value || '';
    setFormData((p) => ({ ...p, contact: newValue }));
    setSubmitError('');
    setContactStatus('idle');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validateContact(newValue), 600);
  };

  // ── email/password submit ──────────────────────────────────────────────────
  // ── Stage 1: Send OTP ─────────────────────────────────────────────────────
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) { setNameError('Please enter your name'); return; }
    if (contactStatus !== 'valid') { setContactError('Please enter a valid email'); return; }
    setStage('password');
  };



  // ── Stage 3: Set Password & Complete Profile ──────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(formData.password);
    
    if (formData.password.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (!hasNumber || !hasSpecial) { setPwError('Include a number and special character'); return; }
    if (formData.password !== formData.confirmPassword) { setConfirmPwError('Passwords do not match'); return; }

    setLoading(true);
    setSubmitError('');
    try {
      // Create user with email and password
      const { error } = await supabase.auth.signUp({
        email: formData.contact.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim()
          }
        }
      });
      
      if (error) throw error;

      await requestLocation();
      navigate('/home');
    } catch (err) {
      setSubmitError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/home'
        }
      });
      if (error) throw error;
    } catch (err) {
      setSubmitError('Google sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Guest sign-in ──────────────────────────────────────────────────────────
  const handleGuest = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      console.log("Mocking Guest Login");
      updateUser({
        uid: 'guest-' + Math.random().toString(36).substr(2, 9),
        name: 'Guest User',
        avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=84cc16&color=fff',
        isAnonymous: true
      });
      requestLocation();
      navigate('/home', { replace: true });
    } catch (err) {
      setSubmitError('Guest login failed.');
    } finally {
      setLoading(false);
    }
  };


  const isReady = formData.name.trim().length >= 2
    && contactStatus === 'valid'
    && formData.password.length >= 8
    && formData.password === formData.confirmPassword
    && agreed;

  return (
    <div className="auth-split-page">
      {/* ── Left Side: Visuals ────────────────────────────────────────── */}
      <div className="auth-visual-side">
        <div className="auth-visual-bg"></div>
        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-logo">
            <Logo size={36} />
            <span>ResourceShare</span>
          </Link>
          <h1 className="auth-visual-headline">
            Share more,<br />
            Own less.
          </h1>
          <p className="auth-visual-sub">
            Join 3,800+ neighbors already building a more sustainable and 
            connected community through shared resources.
          </p>
        </div>
        <div className="auth-visual-footer">
          © 2026 ResourceShare. All rights reserved.
        </div>
      </div>

      {/* ── Right Side: Form ─────────────────────────────────────────── */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <header style={{ marginBottom: '40px' }}>
            <h1 className="auth-title-large">Create account</h1>
            <p className="auth-subtitle-large">Start sharing with your neighbors today.</p>
          </header>

          {stage === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="animate-in">
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Full Name</label>
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

              {/* Email Address */}
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label>Email Address</label>
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
              >
                Continue
              </button>
            </form>
          )}

          {stage === 'password' && (
            <form onSubmit={handleSignUp} className="animate-in">
              <div className="text-center mb-8">
                <div className="icon-container-light-green" style={{ margin: '0 auto 16px' }}>
                  <ShieldCheck size={24} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Secure your account</h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '8px' }}>
                  Almost there! Choose a strong password to finish.
                </p>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Create Password</label>
                <div className={`input-wrapper ${pwError ? 'input-error' : ''}`}>
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

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label>Confirm Password</label>
                <div className={`input-wrapper ${confirmPwError ? 'input-error' : ''}`}>
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

              {/* Terms checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '32px' }}>
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
              >
                {loading ? <><Loader size={18} className="spinning" /> Finalizing...</> : 'Complete Registration'}
              </button>

              <button 
                type="button" 
                className="btn-link w-full mt-4" 
                onClick={() => setStage('details')}
                style={{ fontSize: '14px', color: 'var(--text-gray)' }}
              >
                Go back
              </button>
            </form>
          )}

          {submitError && (
            <div style={{ padding: '12px', marginTop: '24px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px', border: '1px solid #fee2e2' }}>
              {submitError}
            </div>
          )}

          <div className="divider">OR</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              className="btn-google-website"
              onClick={handleGoogle}
              disabled={loading}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="" width={18} />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              className="btn-google-website"
              onClick={handleGuest}
              disabled={loading}
            >
              <User size={18} style={{ color: '#64748b' }} />
              <span>Continue as Guest</span>
            </button>
          </div>

          <p style={{ marginTop: '40px', textAlign: 'center', fontSize: '14px', color: 'var(--text-gray)' }}>
            Already have an account?{' '}
            <button 
              onClick={handleGoToSignIn}
              style={{ 
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--primary)', 
                fontWeight: 700, 
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
            >
              Sign in
            </button>
          </p>

          {/* Admin Portal Link */}
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#15803d'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
              🛡️ Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
