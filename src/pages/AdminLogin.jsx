import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import {
  Shield, Mail, Lock, Eye, EyeOff, Loader,
  ArrowLeft, Lock as LockIcon, AlertTriangle, UserPlus
} from 'lucide-react';
import './AdminAuth.css';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ResourceShareadmin@gmail.com').toLowerCase().trim();

export default function AdminLogin() {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      console.log("Mocking Admin Login for:", email);
      // In mock mode, we assume the user is an admin if they use the correct email
      updateUser({
        uid: 'admin-mock-' + btoa(email).substring(0, 8),
        name: 'Admin',
        email: email.trim(),
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=84cc16&color=fff'
      });

      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
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
            Full Control.<br />
            <span>Zero Limits.</span>
          </h2>
          <p>
            The admin portal gives you complete power over the ResourceShare platform — manage items, users, and monitor activity in real time.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="admin-auth-right">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <button className="admin-back-link" onClick={() => navigate('/login')}>
            <ArrowLeft size={15} /> Back to regular login
          </button>

          <div className="admin-auth-card">
            <div className="admin-auth-card-header">
              <div className="admin-shield-icon">
                <Shield size={32} color="#22c55e" strokeWidth={2} />
              </div>
              <div className="admin-role-tag">
                <Shield size={10} /> Administrator Access
              </div>
              <div className="admin-auth-card-title">Admin Sign In</div>
              <div className="admin-auth-card-sub">
                Sign in with your admin credentials to access the control panel.
              </div>
            </div>

            <form className="admin-auth-form" onSubmit={handleLogin}>
              {/* Email */}
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

              {/* Password */}
              <div className="admin-auth-group">
                <label className="admin-auth-label">Password</label>
                <div className="admin-auth-input-wrap">
                  <Lock size={17} className="admin-auth-input-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="admin-auth-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="admin-auth-input-action" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <Link 
                    to="/admin/forgot-password" 
                    style={{ 
                      fontSize: 12, 
                      color: 'rgba(255,255,255,0.4)', 
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#22c55e'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="admin-auth-error">
                  <AlertTriangle size={15} /> {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="admin-auth-btn" disabled={loading}>
                {loading
                  ? <><Loader size={17} className="spin" /> Authenticating...</>
                  : <><Shield size={17} /> Sign In to Admin Panel</>
                }
              </button>

              <div className="admin-auth-divider"><span>New to admin panel?</span></div>

              <button
                type="button"
                className="admin-auth-btn"
                style={{
                  background: 'transparent',
                  boxShadow: 'none',
                  border: '1.5px solid #22c55e',
                  color: '#22c55e',
                  fontWeight: 700,
                  gap: 8,
                }}
                onClick={() => navigate('/admin/signup')}
              >
                <UserPlus size={17} /> Create Admin Account
              </button>
            </form>

            <div className="admin-security-note">
              <Lock size={12} /> Local Mock Authentication
            </div>
          </div>

          <div className="admin-auth-footer">
            Not an admin?{' '}
            <Link to="/login">Go to regular login</Link>
          </div>

          <div style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <button
              onClick={() => navigate('/admin/signup')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,185,129,0.1))',
                border: '1px solid rgba(34,197,94,0.35)',
                borderRadius: 14,
                padding: '12px 22px',
                color: '#6ee7b7',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,185,129,0.1))'; e.currentTarget.style.transform = 'none'; }}
            >
              <UserPlus size={16} />
              Register as Admin
            </button>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
