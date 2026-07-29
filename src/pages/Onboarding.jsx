import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Package, PlusCircle, Search, User, ShieldCheck,
  TrendingUp, Sparkles, ArrowRight, Home as HomeIcon,
  Compass, Heart, MessageSquare, Settings, LogIn
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import Logo from '../components/Logo';
import './Onboarding.css';

export default function SimpleDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="simple-dashboard-container">
      {/* ── Top Bar Header ────────────────────────────────────────────── */}
      <header className="dashboard-topbar">
        <div className="dashboard-brand" onClick={() => navigate('/home')}>
          <Logo size={28} />
          <span className="brand-name">Lendkart</span>
        </div>

        <form className="dashboard-search-form" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search items, tools, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dashboard-search-input"
          />
        </form>

        <div className="dashboard-topbar-actions">
          {user ? (
            <button className="user-profile-badge" onClick={() => navigate('/profile')}>
              <User size={16} />
              <span>{user.email?.split('@')[0] || 'My Account'}</span>
            </button>
          ) : (
            <div className="auth-btn-group">
              <button className="btn-secondary-sm" onClick={() => navigate('/login')}>
                <LogIn size={15} /> Sign In
              </button>
              <button className="btn-primary-sm" onClick={() => navigate('/signup')}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Dashboard Hero Banner ────────────────────────────────────── */}
      <section className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-tag">
            <Sparkles size={14} /> Community Sharing Platform
          </div>
          <h1>Welcome to <span className="text-accent">Lendkart</span></h1>
          <p>
            Easily borrow tools, equipment, and resources from neighbors nearby or share your unused items to support your community.
          </p>

          <div className="hero-banner-cta">
            <button className="btn-hero-primary" onClick={() => navigate('/home')}>
              <HomeIcon size={18} /> Open Main Dashboard <ArrowRight size={16} />
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/add-item')}>
              <PlusCircle size={18} /> List an Item
            </button>
            <button className="btn-hero-outline" onClick={() => navigate('/explore')}>
              <Compass size={18} /> Explore Catalog
            </button>
          </div>
        </div>
      </section>

      {/* ── Key Metrics Cards Grid ───────────────────────────────────── */}
      <section className="dashboard-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-green">
            <Package size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-number">12,400+</span>
            <span className="metric-label">Items Available</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue">
            <TrendingUp size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-number">3,800+</span>
            <span className="metric-label">Active Neighbors</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple">
            <ShieldCheck size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-number">98%</span>
            <span className="metric-label">Verified Trust Score</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber">
            <Heart size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-number">520 kg</span>
            <span className="metric-label">Waste Prevented</span>
          </div>
        </div>
      </section>

      {/* ── Quick Navigation Shortcuts ───────────────────────────────── */}
      <section className="dashboard-shortcuts-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="shortcuts-grid">
          <div className="shortcut-card" onClick={() => navigate('/explore')}>
            <Compass size={32} className="shortcut-icon icon-cyan" />
            <h3>Browse Products</h3>
            <p>Explore tools, electronics, camping gear, and appliances near you.</p>
            <span className="shortcut-link">Explore Items <ArrowRight size={14} /></span>
          </div>

          <div className="shortcut-card" onClick={() => navigate('/add-item')}>
            <PlusCircle size={32} className="shortcut-icon icon-green" />
            <h3>List Your Item</h3>
            <p>Monetize or lend your unused household equipment safely.</p>
            <span className="shortcut-link">Add New Item <ArrowRight size={14} /></span>
          </div>

          <div className="shortcut-card" onClick={() => navigate('/requests')}>
            <MessageSquare size={32} className="shortcut-icon icon-purple" />
            <h3>My Requests</h3>
            <p>Track your ongoing borrow requests, pickups, and messages.</p>
            <span className="shortcut-link">View Requests <ArrowRight size={14} /></span>
          </div>

          <div className="shortcut-card" onClick={() => navigate('/profile')}>
            <Settings size={32} className="shortcut-icon icon-amber" />
            <h3>Account & Settings</h3>
            <p>Manage your saved addresses, payment methods, and profile.</p>
            <span className="shortcut-link">Open Settings <ArrowRight size={14} /></span>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="dashboard-simple-footer">
        <p>© 2026 Lendkart Community Platform. All rights reserved.</p>
        <div className="footer-links">
          <span onClick={() => navigate('/home')}>Home</span>
          <span onClick={() => navigate('/explore')}>Explore</span>
          <span onClick={() => navigate('/terms')}>Terms</span>
          <span onClick={() => navigate('/help-support')}>Help & Support</span>
        </div>
      </footer>
    </div>
  );
}
