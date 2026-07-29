import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function VerifyEmail() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || '';

  const [checking,   setChecking]   = useState(false);
  const [resending,  setResending]  = useState(false);
  const [resent,     setResent]     = useState(false);
  const [error,      setError]      = useState('');
  const [countdown,  setCountdown]  = useState(0);

  // In mock mode, auto-verify after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Mocking email verification success");
      navigate('/explore', { replace: true });
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleCheckNow = async () => {
    setChecking(true);
    // Simulate check
    setTimeout(() => {
      navigate('/explore', { replace: true });
      setChecking(false);
    }, 1000);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setTimeout(() => {
      setResent(true);
      setCountdown(60);
      setResending(false);
    }, 1000);
  };

  return (
    <div className="container flex-col">
      <div className="header-nav">
        <button className="back-btn" onClick={() => navigate('/signup')}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">ResourceShare</h3>
        <div style={{ width: 24 }} />
      </div>

      {/* Hero illustration */}
      <div className="icon-wrapper mt-8" style={{ flexDirection: 'column', gap: 8 }}>
        <div className="icon-container-green" style={{ width: 80, height: 80 }}>
          <Mail size={40} color="var(--text-dark)" />
        </div>
      </div>

      <h1 className="mt-6" style={{ fontSize: 26 }}>Check your inbox</h1>
      <p className="subtitle mt-3 mb-2">
        We sent a verification link to:
      </p>
      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-dark)', marginBottom: 24, wordBreak: 'break-all' }}>
        {email}
      </p>
      <p className="subtitle mb-8">
        Click the link in the email to verify your account. Once verified, you'll be taken to the app automatically.
      </p>

      {/* Steps */}
      <div className="verify-steps">
        {['Open the email from ResourceShare', 'Click "Verify my email"', 'Come back here — you\'ll be logged in automatically'].map((step, i) => (
          <div className="verify-step" key={i}>
            <div className="verify-step-num">{i + 1}</div>
            <p>{step}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="field-error mt-4" style={{ fontSize: 13, justifyContent: 'center' }}>
          {error}
        </div>
      )}

      {resent && !error && (
        <p className="field-success mt-4" style={{ textAlign: 'center' }}>
          ✓ Verification email resent!
        </p>
      )}

      <button
        className="btn btn-primary mt-6"
        onClick={handleCheckNow}
        disabled={checking}
      >
        {checking ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={18} className="spinning" /> Checking…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} /> I've verified my email
          </span>
        )}
      </button>

      <button
        className="btn btn-outline mt-3"
        onClick={handleResend}
        disabled={resending || countdown > 0}
        style={{ opacity: countdown > 0 ? 0.5 : 1 }}
      >
        {resending ? 'Sending…' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
      </button>

      <p className="text-center mt-6" style={{ fontSize: 13, color: 'var(--text-gray)' }}>
        Wrong address?{' '}
        <span
          style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => navigate('/signup')}
        >
          Go back
        </span>
      </p>
    </div>
  );
}
