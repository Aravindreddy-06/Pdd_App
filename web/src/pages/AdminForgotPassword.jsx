import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Mail, Loader, ArrowLeft, Send, CheckCircle, AlertTriangle
} from 'lucide-react';
import './AdminAuth.css';

export default function AdminForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      console.log("Mocking password reset for:", email);
      // In mock mode, we just simulate a delay and show success
      setTimeout(() => {
        setSubmitted(true);
      }, 1000);
    } catch (err) {
      setError('Failed to send reset email.');
    } finally {
      // Keep loading true for a bit
    }
  };

  return (
    <div className="admin-auth-page">
      {/* Animated background */}
      <div className="admin-auth-bg">
        <div className="admin-auth-blob admin-auth-blob-1" />
        <div className="admin-auth-blob admin-auth-blob-2" />
        <div className="admin-auth-blob admin-auth-blob-3" />
      </div>

      {/* Left panel */}
      <div className="admin-auth-left">
        <div className="admin-auth-left-bg" />
        <div className="admin-auth-left-logo">
          <div className="admin-auth-left-logo-icon">
            <Shield size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="admin-auth-left-logo-text">ResourceShare Admin</span>
        </div>

        <div className="admin-auth-left-headline">
          <h2>
            Secure Access.<br />
            <span>Restored.</span>
          </h2>
          <p>
            Recover your administrator account to continue managing the platform with full control.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="admin-auth-right">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <button className="admin-back-link" onClick={() => navigate('/admin/login')}>
            <ArrowLeft size={15} /> Back to admin login
          </button>

          <div className="admin-auth-card">
            <div className="admin-auth-card-header">
              <div className="admin-shield-icon">
                {submitted ? (
                  <CheckCircle size={32} color="#22c55e" strokeWidth={2} />
                ) : (
                  <Mail size={32} color="#22c55e" strokeWidth={2} />
                )}
              </div>
              <div className="admin-role-tag">
                <Shield size={10} /> Password Recovery
              </div>
              <div className="admin-auth-card-title">
                {submitted ? 'Check Your Inbox' : 'Forgot Password?'}
              </div>
              <div className="admin-auth-card-sub">
                {submitted 
                  ? `We've sent a password reset link to ${email}. Please check your inbox.`
                  : 'Enter your administrator email and we will send you a link to reset your password.'
                }
              </div>
            </div>

            {!submitted ? (
              <form className="admin-auth-form" onSubmit={handleReset}>
                <div className="admin-auth-group">
                  <label className="admin-auth-label">Admin Email</label>
                  <div className="admin-auth-input-wrap">
                    <Mail size={17} className="admin-auth-input-icon" />
                    <input
                      type="email"
                      className="admin-auth-input"
                      placeholder="Enter the Email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="admin-auth-error">
                    <AlertTriangle size={15} /> {error}
                  </div>
                )}

                <button type="submit" className="admin-auth-btn" disabled={loading}>
                  {loading
                    ? <><Loader size={17} className="spin" /> Sending...</>
                    : <><Send size={17} /> Send Reset Link</>
                  }
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button 
                  className="admin-auth-btn" 
                  onClick={() => navigate('/admin/login')}
                >
                  <ArrowLeft size={17} /> Back to Sign In
                </button>
                <div 
                  style={{ 
                    textAlign: 'center', 
                    fontSize: 13, 
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: 8 
                  }}
                >
                  Didn't receive the email?{' '}
                  <span 
                    style={{ color: '#22c55e', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => setSubmitted(false)}
                  >
                    Try again
                  </span>
                </div>
              </div>
            )}

            <div className="admin-security-note">
              <Shield size={12} /> Secure Account Recovery
            </div>
          </div>

          <div className="admin-auth-footer">
            Remembered your password?{' '}
            <Link to="/admin/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
