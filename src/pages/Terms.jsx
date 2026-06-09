import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, ScrollText, AlertCircle, Scale, Lock, Globe } from 'lucide-react';
import './Onboarding.css'; // Reuse mission-style layout variables
import './Auth.css';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="mission-page" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <header className="mission-topbar" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="mission-logo" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <span>Legal & Transparency</span>
        </div>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 24px 80px' }}>
        
        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--primary-lightest)', borderRadius: '24px', color: 'var(--primary)', marginBottom: '24px' }}>
            <Scale size={40} />
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px' }}>
            Terms & Community Guidelines
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-gray)', maxWidth: '600px', margin: '0 auto' }}>
            Transparency is the foundation of trust. Please review our realistic approach to building a safe sharing economy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
          
          {/* ── Section 1: Terms of Service ─────────────────────────── */}
          <section style={{ background: 'white', borderRadius: '32px', padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b' }}>
                <ScrollText size={24} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Terms of Service</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>1. Platform Nature</h4>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                  ResourceShare is a <strong>facilitation platform</strong>. We do not own, inspect, or store the items listed. All sharing agreements are directly between the "Owner" and the "Borrower."
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>2. Safety & Condition</h4>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                  Owners must ensure items are in safe, working condition. Borrowers must use items according to their intended purpose and safety labels. Prohibited items include weapons, hazardous chemicals, and illegal substances.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>3. Damage & Liability</h4>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                  In the event of damage, users agree to communicate in good faith. Borrowers are responsible for repair or replacement costs unless otherwise agreed. ResourceShare's "Trust Guarantee" covers verified disputes up to ₹10,000.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>4. Community Conduct</h4>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                  Respect and punctuality are mandatory. Chronic late returns or poor item maintenance may lead to account suspension.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 2: Privacy Policy ──────────────────────────── */}
          <section style={{ background: 'white', borderRadius: '32px', padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '12px', color: 'var(--primary)' }}>
                <Lock size={24} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Privacy & Data Usage</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flexShrink: 0, marginTop: '4px' }}><Globe size={20} color="#94a3b8" /></div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Geolocation Tracking</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                    We use your high-precision GPS data ONLY to show you items in your immediate neighborhood. Your exact coordinates are never shared with other users; we only show a "general area" radius to protect your home privacy.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flexShrink: 0, marginTop: '4px' }}><ShieldCheck size={20} color="#94a3b8" /></div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Identity Verification</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                    To ensure community safety, we may require a verified mobile number and ID check. This data is encrypted and stored securely; it is never sold to third-party advertisers.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flexShrink: 0, marginTop: '4px' }}><AlertCircle size={20} color="#94a3b8" /></div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Chat & Communication</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                    Messages between users are logged for safety and dispute resolution purposes. We recommend keeping all transactions and communication within the platform to maintain the Trust Guarantee coverage.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <button 
            className="btn-primary-website" 
            onClick={() => navigate(-1)}
            style={{ maxWidth: '300px', margin: '0 auto' }}
          >
            I Accept & Understand
          </button>
          <p style={{ marginTop: '24px', fontSize: '14px', color: '#94a3b8' }}>
            Last updated: May 2026. These terms are subject to change with 30 days notice to active users.
          </p>
        </div>
      </main>
    </div>
  );
}
