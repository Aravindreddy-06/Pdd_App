import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, Loader, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
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
    <div className="container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="auth-container">
        <div className="header-nav">
          <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h3 className="nav-title">ResourceShare</h3>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="text-center mt-12 mb-8">
          <div className="icon-container-light-green" style={{ margin: '0 auto' }}>
            <Mail size={32} color="var(--primary)" />
          </div>
        </div>

        {!submitted ? (
          <>
            <h1 className="text-center mt-4">Forgot Password?</h1>
            <p className="subtitle text-center mt-2 mb-8">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleReset} style={{ width: '100%' }}>
              <div className="form-group">
                <label className="input-label">Email Address</label>
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

              {error && <div className="submit-error mt-4">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary mt-8 flex-row items-center justify-center gap-2"
                disabled={loading}
                style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <><Loader size={18} className="spinning" /> Sending...</>
                ) : (
                  <><Send size={20} /> Send Reset Link</>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle size={64} color="var(--primary)" className="mb-4" style={{ margin: '0 auto' }} />
            <h1 className="mt-4">Check Your Email</h1>
            <p className="subtitle mt-2 mb-8">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Back to Login
            </button>
            <p className="mt-6 text-gray" style={{ fontSize: '14px' }}>
              Didn't receive the email? <span className="text-primary font-bold" style={{ cursor: 'pointer' }} onClick={() => setSubmitted(false)}>Try again</span>
            </p>
          </div>
        )}

        <p className="text-center mt-8 login-link">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-bold" style={{ textDecoration: 'none' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
