import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, Loader
} from 'lucide-react';
import Logo from '../components/Logo';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ResourceShareadmin@gmail.com').toLowerCase().trim();

export default function Login() {
  const navigate = useNavigate();
  const { requestLocation } = useUser();

  const [contact,      setContact]     = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Simple validation check
  const isEmail = contact.includes('@');
  const isPhone = /^[+\d]/.test(contact.trim()) && contact.trim().length >= 10;
  const isValidContact = isEmail || isPhone;

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const host = window.location.hostname;
      const redirectUrl = (host === 'localhost' || host.includes('-projects.vercel.app'))
        ? 'https://resource-sharing.vercel.app/home'
        : `${window.location.origin}/home`;

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

  // ── Email / Password login ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidContact) {
      setSubmitError('Please enter a valid registered email or phone number.');
      return;
    }
    if (!password) return;

    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: contact.trim(),
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setSubmitError('Invalid credentials or account does not exist. Please sign up if you are a new user.');
        } else {
          throw error;
        }
        return;
      }
      
      await requestLocation();
      const loggedEmail = contact.trim().toLowerCase();
      navigate(loggedEmail === ADMIN_EMAIL ? '/admin' : '/home', { replace: true });
    } catch (err) {
      setSubmitError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-centered" style={{ minHeight: '100vh', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-wrapper" style={{ paddingTop: '2vh', paddingBottom: '4vh' }}>
        
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <Logo size={32} />
          <span className="auth-logo-text">Lendkart</span>
        </Link>

        {/* Card */}
        <div className="auth-card">
          <h1 className="auth-title">Sign in</h1>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Email or Phone */}
            <div className="form-group mb-4">
              <label className="input-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>Email or mobile phone number</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="input-field"
                  placeholder="name@example.com"
                  value={contact}
                  onChange={(e) => { setContact(e.target.value); setSubmitError(''); }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group mb-4">
              <div className="flex-row justify-between items-center mb-1">
                <label className="input-label mb-0" style={{ fontWeight: 700, fontSize: '13px' }}>Password</label>
                <Link
                  to="/forgot-password"
                  className="text-primary font-medium"
                  style={{ fontSize: '12px', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field"
                  placeholder=""
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSubmitError(''); }}
                  required
                />
                <button type="button" className="input-action" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {submitError && (
              <div className="submit-error mb-4">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary flex-row items-center justify-center gap-2"
              disabled={loading}
              style={{ width: '100%', borderRadius: '8px', padding: '12px', fontSize: '14px', opacity: loading ? 0.6 : 1 }}
            >
              {loading
                ? <><Loader size={16} className="spinning" /> Signing in...</>
                : 'Sign in'
              }
            </button>
          </form>

          <div className="mt-6" style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: 1.5 }}>
            By continuing, you agree to Lendkart's{' '}
            <Link to="/terms" className="text-primary font-medium" style={{ textDecoration: 'none' }}>Conditions of Use</Link> and{' '}
            <Link to="/terms" className="text-primary font-medium" style={{ textDecoration: 'none' }}>Privacy Notice</Link>.
          </div>

          <div className="divider mt-6 mb-6" style={{ fontSize: '11px', color: '#767676' }}>
            <span style={{ backgroundColor: 'var(--bg-color)', padding: '0 8px' }}>New to Lendkart?</span>
          </div>

          <Link to="/signup" style={{ textDecoration: 'none', display: 'block' }}>
            <button
              type="button"
              className="btn-social"
              style={{ width: '100%', borderRadius: '8px', padding: '10px', backgroundColor: '#f3f3f3', border: '1px solid #d5d9d9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '14px', color: '#0f1111' }}
            >
              Create your Lendkart account
            </button>
          </Link>

          <div className="divider mt-6 mb-6" style={{ fontSize: '11px', color: '#767676' }}>
            <span style={{ backgroundColor: 'var(--bg-color)', padding: '0 8px' }}>Or sign in with</span>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogle}
            disabled={loading}
            style={{ width: '100%', borderRadius: '8px', padding: '10px' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google"
              width={18}
              height={18}
            />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Continue with Google</span>
          </button>
        </div>
      </div>

      {/* Admin Portal Link */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Link
          to="/admin/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--text-gray)', textDecoration: 'none',
            padding: '8px 16px', borderRadius: '20px',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#15803d'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-gray)'; }}
        >
          🛡️ Admin Portal
        </Link>
      </div>
    </div>
  );
}
