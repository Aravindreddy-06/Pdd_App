import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import {
  Shield, Mail, Lock, Eye, EyeOff, Loader,
  ArrowLeft, User, CheckCircle2, AlertTriangle, Lock as LockIcon
} from 'lucide-react';
import './AdminAuth.css';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@ResourceShare.com';

const REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One number',            test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

export default function AdminSignup() {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCo, setShowCo]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Secret key stored in env to prevent unauthorised admin creation
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'NS-ADMIN-2024';

  const pwStrength = REQUIREMENTS.filter(r => r.test(password));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations (Enforce strict format: RS-ADMIN-2026-firstname)
    const firstName = name.trim().split(' ')[0];
    const expectedKey = `${ADMIN_SECRET}-${firstName}`;
    
    if (secretKey.trim().toLowerCase() !== expectedKey.toLowerCase()) {
      setError(`Invalid secret key. Please contact the system administrator if you are unsure.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (pwStrength.length < 4) {
      setError('Password does not meet all requirements.');
      return;
    }

    setLoading(true);
    try {
      console.log("Mocking admin registration:", { name, email, secretKey });
      
      updateUser({
        uid: 'admin-mock-' + Date.now(),
        name: name || 'Admin',
        email: email.trim(),
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=84cc16&color=fff',
      });

      setSuccess('Admin account created! Redirecting to dashboard...');
      setTimeout(() => navigate('/admin', { replace: true }), 1500);
    } catch (err) {
      setError('Signup failed.');
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
            Set Up Your<br />
            <span>Admin Account.</span>
          </h2>
          <p>
            Create the administrator account to unlock full control over the ResourceShare platform. Only authorised personnel can complete this process.
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
                <Shield size={32} color="#22c55e" strokeWidth={2} />
              </div>
              <div className="admin-role-tag">
                <Shield size={10} /> Admin Registration
              </div>
              <div className="admin-auth-card-title">Create Admin Account</div>
              <div className="admin-auth-card-sub">
                Requires the authorised email and admin secret key.
              </div>
            </div>

            <form className="admin-auth-form" onSubmit={handleSignup}>
              {/* Name */}
              <div className="admin-auth-group">
                <label className="admin-auth-label">Full Name</label>
                <div className="admin-auth-input-wrap">
                  <User size={17} className="admin-auth-input-icon" />
                  <input
                    type="text"
                    className="admin-auth-input"
                    placeholder="Admin Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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

              {/* Admin Secret */}
              <div className="admin-auth-group">
                <label className="admin-auth-label">Admin Secret Key</label>
                <div className="admin-auth-input-wrap">
                  <LockIcon size={17} className="admin-auth-input-icon" />
                  <input
                    type="password"
                    className="admin-auth-input"
                    placeholder="Enter admin secret key"
                    value={secretKey}
                    onChange={e => { setSecretKey(e.target.value); setError(''); }}
                    required
                    autoComplete="off"
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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="admin-auth-input-action" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px', marginLeft: '4px' }}>
                  Must include 8+ characters, one uppercase, one number, and one special character.
                </p>
                {/* Strength bar */}
                {password && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {REQUIREMENTS.map((r, i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: i < pwStrength.length ? '#22c55e' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="admin-auth-group">
                <label className="admin-auth-label">Confirm Password</label>
                <div className="admin-auth-input-wrap">
                  <Lock size={17} className="admin-auth-input-icon" />
                  <input
                    type={showCo ? 'text' : 'password'}
                    className="admin-auth-input"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    required
                    autoComplete="new-password"
                    style={{ borderColor: confirm && password !== confirm ? '#ef4444' : undefined }}
                  />
                  <button type="button" className="admin-auth-input-action" onClick={() => setShowCo(p => !p)}>
                    {showCo ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error / Success */}
              {error && (
                <div className="admin-auth-error">
                  <AlertTriangle size={15} /> {error}
                </div>
              )}
              {success && (
                <div className="admin-auth-success">
                  <CheckCircle2 size={15} /> {success}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="admin-auth-btn" disabled={loading}>
                {loading
                  ? <><Loader size={17} className="spin" /> Creating Account...</>
                  : <><Shield size={17} /> Create Admin Account</>
                }
              </button>
            </form>

            <div className="admin-security-note">
              <Lock size={12} /> Protected by secret key verification
            </div>
          </div>

          <div className="admin-auth-footer">
            Already have an admin account?{' '}
            <Link to="/admin/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
