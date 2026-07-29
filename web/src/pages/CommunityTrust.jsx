import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Home, Users, MessageSquare, Bell, Star, CheckCircle2 } from 'lucide-react';
import './CommunityTrust.css';

export default function CommunityTrust() {
  const navigate = useNavigate();

  const badges = [
    { 
      icon: ShieldCheck, 
      label: 'Identity Verified', 
      desc: 'User has successfully linked a valid government ID. This confirms the person is who they say they are.',
      color: '#f0fdf4',
      iconColor: '#22c55e'
    },
    { 
      icon: Home, 
      label: 'Address Confirmed', 
      desc: 'Verified through a unique code mailed to the user\'s home address, ensuring they live in your neighborhood.',
      color: '#f0fdf4',
      iconColor: '#22c55e'
    }
  ];

  const tips = [
    { icon: Users, label: 'Meet in Public', desc: 'For the first exchange, choose a well-lit, public place like a local coffee shop or park.', iconColor: '#22c55e' },
    { icon: MessageSquare, label: 'Keep it on ResourceShare', desc: 'Use our secure messaging system for all communications until you feel comfortable.', iconColor: '#22c55e' },
    { icon: Bell, label: 'Share your Plans', desc: 'Let a friend or family member know who you are meeting and where.', iconColor: '#22c55e' },
    { icon: Star, label: 'Check Ratings', desc: 'Read reviews from other neighbors to learn about their experiences.', iconColor: '#22c55e' },
  ];

  const guidelines = [
    { num: '01', label: 'Be Respectful', desc: 'Treat your neighbors with kindness. Harassment or discrimination of any kind is strictly prohibited.' },
    { num: '02', label: 'Honesty is Key', desc: 'Be truthful about the condition of items you share. Accuracy builds trust.' },
    { num: '03', label: 'Safety First', desc: 'Never share items that are dangerous or prohibited by local laws.' },
  ];

  return (
    <div className="trust-page">
      <div className="header-nav px-4 pt-6 pb-2">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">Community Trust</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="trust-hero">
        <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Community" className="hero-img" />
        <div className="hero-overlay">
          <h2 className="hero-title">Building a Safer Community Together</h2>
        </div>
      </div>

      <div className="trust-content">
        <div className="trust-intro">
          <h3 className="trust-section-heading">Our Trust System</h3>
          <p className="trust-intro-text">
            ResourceShare relies on mutual respect and verified identities to keep everyone safe. Here is how we maintain a secure environment for all.
          </p>
        </div>

        <div className="verified-badges-section">
          <h4 className="trust-subtitle">Verified Badges</h4>
          <div className="badges-list">
            {badges.map((badge, idx) => (
              <div key={idx} className="badge-card">
                <div className="badge-icon-bg" style={{ backgroundColor: badge.color }}>
                  <badge.icon size={24} color={badge.iconColor} />
                </div>
                <div className="badge-text">
                  <span className="badge-label">{badge.label}</span>
                  <p className="badge-desc">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="safety-tips-section">
          <div className="section-header">
            <ShieldCheck size={20} color="#22c55e" />
            <h4 className="trust-subtitle no-margin">Safety Tips for Meeting</h4>
          </div>
          <div className="tips-list">
            {tips.map((tip, idx) => (
              <div key={idx} className="tip-card">
                <tip.icon size={20} color={tip.iconColor} className="tip-icon" />
                <div className="tip-text">
                  <span className="tip-label">{tip.label}</span>
                  <p className="tip-desc">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="guidelines-section">
          <h4 className="trust-subtitle">Community Guidelines</h4>
          <div className="guidelines-list">
            {guidelines.map((g, idx) => (
              <div key={idx} className="guideline-item">
                <span className="guideline-num">{g.num}</span>
                <div className="guideline-content">
                  <span className="guideline-label">{g.label}</span>
                  <p className="guideline-desc">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trust-footer">
          <button className="get-verified-btn" onClick={() => navigate('/verify-email')}>
            <CheckCircle2 size={20} />
            Get Verified Now
          </button>
          <p className="tos-text">By participating, you agree to our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}
