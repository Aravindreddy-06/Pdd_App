import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  MapPin, 
  Package, 
  Heart, 
  LogOut, 
  Edit2, 
  ChevronRight, 
  Star, 
  Clock, 
  User as UserIcon, 
  Shield, 
  Bell, 
  HelpCircle,
  Navigation,
  Edit3,
  ShieldCheck,
  Loader
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, requestLocation } = useUser();

  if (loading) {
    return (
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader className="spinning" size={48} color="var(--primary)" />
      </div>
    );
  }

  const currentUser = user || {
    name: 'Guest User',
    email: 'guest@neighborshare.app',
    avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=84cc16&color=000&bold=true',
    location: 'Thandalam',
    rating: 5.0,
    shared: 0,
    borrowed: 0,
    memberSince: new Date().getFullYear().toString()
  };

  const hasActivity = (
    Number(currentUser?.shared || 0) > 0 || 
    Number(currentUser?.borrowed || 0) > 0 || 
    Number(currentUser?.helpedCount || 0) > 0 ||
    Boolean(currentUser?.isVerified)
  );

  const memberSinceYear = currentUser?.memberSince || (() => {
    let saved = localStorage.getItem('rs_join_date');
    if (!saved) {
      saved = new Date().getFullYear().toString();
      localStorage.setItem('rs_join_date', saved);
    }
    return saved;
  })();

  return (
    <div className="profile-page">
      
      {/* ── Banner & Avatar Header ───────────────────────── */}
      <div className="profile-header">
        <div className="profile-banner">
          {/* Banner background is handled by CSS gradient/image */}
        </div>
        
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <img src={currentUser?.avatar} alt={currentUser?.name} className="profile-avatar" />
            <button className="edit-avatar-btn" onClick={() => navigate('/edit-profile')} title="Change Avatar">
              <Edit3 size={16} />
            </button>
          </div>
          
          <div className="profile-info-top">
            <div className="flex-row items-center gap-3">
              <h1 className="profile-name">{currentUser?.name}</h1>
              {hasActivity && (
                <div className="verified-badge" title="Verified Neighbor">
                  <ShieldCheck size={16} /> Verified
                </div>
              )}
            </div>
            
            <p className="profile-email">{currentUser?.email}</p>
            
            <div className="location-pill mt-4">
              <MapPin size={16} />
              {loading ? "Detecting..." : (currentUser?.location || "Location not set")}
            </div>
          </div>
          
          <div className="profile-actions-top">
            <button className="btn btn-outline" onClick={() => navigate('/edit-profile')}>
              <Edit3 size={16} /> Edit Profile
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')}>
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout (Stats & Settings) ──────────────── */}
      <div className="profile-layout">
        
        {/* Left Column: Stats & Activity */}
        <div className="profile-left">
          <div className="profile-section">
            <h3 className="section-title">Community Standing</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <Star size={24} className="stat-icon text-primary" />
                <div className="stat-info">
                  <span className="stat-value">{currentUser?.rating || '5.0'}</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
              <div className="stat-card">
                <Package size={24} className="stat-icon text-primary" />
                <div className="stat-info">
                  <span className="stat-value">{currentUser?.shared || 0}</span>
                  <span className="stat-label">Items Shared</span>
                </div>
              </div>
              <div className="stat-card">
                <Heart size={24} className="stat-icon text-primary" />
                <div className="stat-info">
                  <span className="stat-value">{currentUser?.borrowed || 0}</span>
                  <span className="stat-label">Borrowed</span>
                </div>
              </div>
              <div className="stat-card">
                <Clock size={24} className="stat-icon text-primary" />
                <div className="stat-info">
                  <span className="stat-value">Active Member</span>
                  <span className="stat-label">Member Since {memberSinceYear}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section mt-8">
            <h3 className="section-title">Recent Activity</h3>
            <div className="empty-state" style={{ padding: '32px', background: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <Package size={32} className="text-light mb-2" />
              <p>No recent activity.</p>
              <button className="btn-ghost mt-2" onClick={() => navigate('/explore')}>Explore items nearby</button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Menu */}
        <div className="profile-right">
          <div className="profile-section">
            <h3 className="section-title">Account</h3>
            <div className="menu-group">
              <div className="menu-item" onClick={() => navigate('/my-items')}>
                <div className="menu-icon-wrapper"><Package size={18} /></div>
                <div className="menu-text-group">
                  <span className="menu-text">My Items</span>
                  <span className="menu-sub">Manage your shared inventory</span>
                </div>
                <ChevronRight size={18} color="var(--text-light)" />
              </div>
              
              <div className="menu-divider" />
              
              <div className="menu-item" onClick={() => navigate('/settings')}>
                <div className="menu-icon-wrapper"><Settings size={18} /></div>
                <div className="menu-text-group">
                  <span className="menu-text">Settings</span>
                  <span className="menu-sub">Privacy, notifications, account</span>
                </div>
                <ChevronRight size={18} color="var(--text-light)" />
              </div>
            </div>
          </div>

          <div className="profile-section mt-6">
            <h3 className="section-title">Support</h3>
            <div className="menu-group">
              <div className="menu-item" onClick={() => navigate('/community-trust')}>
                <div className="menu-icon-wrapper"><ShieldCheck size={18} /></div>
                <div className="menu-text-group">
                  <span className="menu-text">Trust & Safety</span>
                  <span className="menu-sub">Learn how we keep the community safe</span>
                </div>
                <ChevronRight size={18} color="var(--text-light)" />
              </div>

              <div className="menu-divider" />

              <div className="menu-item" onClick={() => navigate('/help-support')}>
                <div className="menu-icon-wrapper"><HelpCircle size={18} /></div>
                <div className="menu-text-group">
                  <span className="menu-text">Help Center</span>
                  <span className="menu-sub">FAQs and contact support</span>
                </div>
                <ChevronRight size={18} color="var(--text-light)" />
              </div>
            </div>
          </div>

          <div className="profile-section mt-6">
            <button className="logout-btn" onClick={() => navigate('/logout')}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
