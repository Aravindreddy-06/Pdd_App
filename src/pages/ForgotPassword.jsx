import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, Loader, CheckCircle, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Stages: 1 = email, 2 = otp, 3 = new_password, 4 = success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'forgot_password' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP code');
      }

      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to send reset OTP email');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'forgot_password' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), purpose: 'forgot_password' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to verify OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(newPassword);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasNumber || !hasSpecial) {
      setError('Password must include a number and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="auth-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div className="header-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h3 className="nav-title" style={{ fontSize: '18px', fontWeight: 700 }}>Lendkart</h3>
          <div style={{ width: 24 }}></div>
        </div>

        {/* ── STEP 1: ENTER EMAIL ── */}
        {step === 1 && (
          <div className="animate-in">
            <div className="text-center mt-6 mb-6">
              <div className="icon-container-light-green" style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={28} color="#10b981" />
              </div>
              <h1 className="text-center mt-2" style={{ fontSize: '24px', fontWeight: 700 }}>Forgot Password?</h1>
              <p className="subtitle text-center mt-2 mb-6" style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
                No worries! Enter your registered email and we'll send you an OTP to verify and reset your password.
              </p>
            </div>

            <form onSubmit={handleSendOtp} style={{ width: '100%' }}>
              <div className="form-group mb-4">
                <label className="input-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              {error && <div className="submit-error mt-4" style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary mt-6 flex-row items-center justify-center gap-2"
                disabled={loading || !email.trim()}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <><Loader size={18} className="spinning" /> Sending OTP...</>
                ) : (
                  <><Send size={18} /> Send Reset OTP</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: VERIFY OTP ── */}
        {step === 2 && (
          <div className="animate-in">
            <div className="text-center mt-6 mb-6">
              <div className="icon-container-light-green" style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={28} color="#10b981" />
              </div>
              <h1 className="text-center mt-2" style={{ fontSize: '24px', fontWeight: 700 }}>Enter Reset OTP</h1>
              <p className="subtitle text-center mt-2 mb-6" style={{ color: 'var(--text-gray)', fontSize: '14px', lineHeight: '1.5' }}>
                We've sent a 6-digit OTP code to<br />
                <strong style={{ color: '#ffffff' }}>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ width: '100%' }}>
              <div className="form-group mb-6">
                <label className="input-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>6-DIGIT OTP CODE</label>
                <div className="input-wrapper" style={{ justifyContent: 'center' }}>
                  <input
                    type="text"
                    maxLength={6}
                    className="input-field"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold', width: '100%', padding: '12px' }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && <div className="submit-error mt-4" style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary mt-6 flex-row items-center justify-center gap-2"
                disabled={loading || otp.length < 6}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <><Loader size={18} className="spinning" /> Verifying OTP...</>
                ) : (
                  'Verify OTP Code'
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#9ca3af' : '#4ade80', fontSize: '14px', fontWeight: 600, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  style={{ fontSize: '14px', color: 'var(--text-gray)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Change email
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: CREATE NEW PASSWORD ── */}
        {step === 3 && (
          <div className="animate-in">
            <div className="text-center mt-6 mb-6">
              <div className="icon-container-light-green" style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={28} color="#10b981" />
              </div>
              <h1 className="text-center mt-2" style={{ fontSize: '24px', fontWeight: 700 }}>Reset Password</h1>
              <p className="subtitle text-center mt-2 mb-6" style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
                Your OTP is verified! Enter a new secure password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
              <div className="form-group mb-4">
                <label className="input-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'block' }}>New Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    required
                  />
                  <button type="button" className="btn-icon" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="input-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'block' }}>Confirm New Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    required
                  />
                  <button type="button" className="btn-icon" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="submit-error mb-4" style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary flex-row items-center justify-center gap-2"
                disabled={loading || !newPassword || !confirmPassword}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <><Loader size={18} className="spinning" /> Updating Password...</>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 4: SUCCESS ── */}
        {step === 4 && (
          <div className="text-center animate-in mt-6">
            <CheckCircle size={64} color="#10b981" className="mb-4" style={{ margin: '0 auto' }} />
            <h1 className="mt-4" style={{ fontSize: '24px', fontWeight: 700 }}>Password Reset Complete</h1>
            <p className="subtitle mt-2 mb-8" style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#4ade80', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}
            >
              Sign In to Your Account
            </button>
          </div>
        )}

        <p className="text-center mt-8 login-link">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-bold" style={{ textDecoration: 'none', color: '#4ade80' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
