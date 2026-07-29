import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Home, Compass, Package, User, Plus,
  Bell, ShoppingCart, Heart, Menu, X, Search, Award, MessageSquare, Users, MapPin, Shield, CheckCheck, Trash2, ChevronRight
} from 'lucide-react';
import Logo from './Logo';
import { useUser } from '../hooks/useUser';
import { useItems } from '../context/ItemContext';
import { useNotifications, timeAgo } from '../context/NotificationContext';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',     icon: Home,    to: '/home' },
  { label: 'Explore',  icon: Compass, to: '/explore' },
  { label: 'Impact',   icon: Award,   to: '/impact' },
  { label: 'Requests', icon: MessageSquare, to: '/requests' },
  { label: 'Circles',  icon: Users, to: '/circles' },
  { label: 'My Items', icon: Package, to: '/my-items' },
];

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ResourceShareadmin@gmail.com').toLowerCase().trim();

const TYPE_COLORS = {
  request:  '#84cc16',
  accepted: '#22c55e',
  returned: '#3b82f6',
  info:     '#f59e0b',
  warning:  '#ef4444',
};

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const { user }  = useUser();
  const { items } = useItems();
  const { notifications, unreadCount, markAsRead, markAllRead, dismiss, clearAll } = useNotifications();
  const path      = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');

  // Calculate live matching product recommendations as user types
  const recommendations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !items) return [];
    return items.filter(item => 
      item.title?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, items]);

  // Keep search input synced with URL parameter on /explore page
  useEffect(() => {
    if (location.pathname === '/explore') {
      const q = searchParams.get('q') || searchParams.get('search') || '';
      setSearchQuery(q);
    }
  }, [location.pathname, searchParams]);

  // Close notification & search dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close search suggestions on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const query = searchQuery.trim();
    if (query) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* ── Section 1: Logo & Location ── */}
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <Logo size={28} />
            <span className="navbar-logo-text">Lendkart</span>
          </div>
          
          <div className="navbar-location" onClick={() => navigate('/location-access')}>
            <MapPin size={16} />
            <div className="location-text">
              <span className="location-label">Deliver to</span>
              <span className="location-value">{user?.location?.split(',')[0] || user?.address?.split(',')[0] || 'Select Location'}</span>
            </div>
          </div>
        </div>

        {/* ── Section 2: Search Bar ── */}
        <div className="navbar-search-container" ref={searchRef}>
          <form className="navbar-search-inner" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search for tools, electronics, books..." 
              className="navbar-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="navbar-search-btn" title="Search">
              <Search size={20} />
            </button>
          </form>

          {/* ── Live Search Product Recommendations Dropdown ── */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="search-suggestions-dropdown">
              {recommendations.length > 0 ? (
                <>
                  <div className="suggestions-header">
                    <span>Matching Product Recommendations</span>
                    <span className="suggestions-count">{recommendations.length} found</span>
                  </div>
                  <div className="suggestions-list">
                    {recommendations.map(item => (
                      <div 
                        key={item.id} 
                        className="suggestion-item"
                        onClick={() => {
                          setShowSuggestions(false);
                          navigate(`/item/${item.id}`);
                        }}
                      >
                        <img 
                          src={item.image || item.img || 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=100&q=80'} 
                          alt={item.title} 
                          className="suggestion-thumb"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=100&q=80'; }}
                        />
                        <div className="suggestion-info">
                          <span className="suggestion-title">{item.title}</span>
                          <div className="suggestion-meta">
                            <span className="suggestion-cat">{item.category || 'General'}</span>
                            <span className="suggestion-price">{item.price}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="suggestion-arrow" />
                      </div>
                    ))}
                  </div>
                  <button 
                    className="suggestions-footer-btn"
                    onClick={(e) => {
                      setShowSuggestions(false);
                      handleSearchSubmit(e);
                    }}
                  >
                    <Search size={15} />
                    <span>View all results for "<strong>{searchQuery}</strong>"</span>
                  </button>
                </>
              ) : (
                <div className="suggestions-empty">
                  <Search size={22} />
                  <span>No products matching "<strong>{searchQuery}</strong>"</span>
                  <button 
                    className="suggestions-footer-btn mt-2"
                    onClick={(e) => {
                      setShowSuggestions(false);
                      handleSearchSubmit(e);
                    }}
                  >
                    <span>Search on Explore page</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 3: Actions ── */}
        <div className="navbar-actions">
          <div className="navbar-user-account" onClick={() => navigate('/profile')}>
            <span className="account-label">Hello, {user?.name?.split(' ')[0] || 'Sign in'}</span>
            <span className="account-value">Account & Lists</span>
          </div>

          <button className="navbar-icon-btn" onClick={() => navigate('/wishlist')} title="Wishlist">
            <Heart size={20} />
          </button>

          {/* ── Notification Bell ── */}
          <div className="navbar-notification-wrapper" ref={notifRef}>
            <button 
              className={`navbar-icon-btn ${showNotifications ? 'active' : ''}`}
              title="Notifications"
              onClick={() => setShowNotifications(o => !o)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notif-dropdown">
                {/* Header */}
                <div className="notif-header">
                  <span className="notif-title">Notifications</span>
                  <div className="notif-header-actions">
                    {unreadCount > 0 && (
                      <button className="notif-action-btn" onClick={markAllRead} title="Mark all read">
                        <CheckCheck size={16} />
                        <span>Mark all read</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button className="notif-action-btn danger" onClick={clearAll} title="Clear all">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <Bell size={36} strokeWidth={1} />
                      <p>You're all caught up!</p>
                      <span>No new notifications</span>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`notif-item ${notif.unread ? 'unread' : ''}`}
                        onClick={() => handleNotifClick(notif)}
                      >
                        <div
                          className="notif-icon"
                          style={{ background: `${TYPE_COLORS[notif.type] || '#84cc16'}22`, color: TYPE_COLORS[notif.type] || '#84cc16' }}
                        >
                          {notif.icon}
                        </div>
                        <div className="notif-body">
                          <p className="notif-item-title">{notif.title}</p>
                          <p className="notif-item-text">{notif.text}</p>
                          <span className="notif-time">{timeAgo(notif.time)}</span>
                        </div>
                        {notif.unread && <div className="notif-dot" />}
                        <button
                          className="notif-dismiss"
                          onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {(user?.role === 'admin' || user?.email?.toLowerCase().trim() === ADMIN_EMAIL) && (
            <button
              className="navbar-icon-btn"
              onClick={() => navigate('/admin')}
              title="Admin Panel"
              style={{ position: 'relative' }}
            >
              <Shield size={20} />
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: '50%',
                background: '#22c55e', border: '2px solid #064e3b'
              }} />
            </button>
          )}

          <button className="navbar-cart-btn" onClick={() => navigate('/cart')}>
            <div className="cart-icon-wrap">
              <ShoppingCart size={22} />
              {user?.cart?.length > 0 && <span className="cart-count">{user.cart.length}</span>}
            </div>
            <span className="cart-text">Cart</span>
          </button>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {NAV_LINKS.map(({ label, icon: Icon, to }) => (
            <button
              key={to}
              className={`mobile-nav-link ${path === to ? 'active' : ''}`}
              onClick={() => { navigate(to); setMobileOpen(false); }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
          <div className="mobile-nav-divider" />
          <button className="mobile-nav-link" onClick={() => { navigate('/profile'); setMobileOpen(false); }}>
            <User size={18} /> Profile
          </button>
          <button className="mobile-nav-link" onClick={() => { navigate('/wishlist'); setMobileOpen(false); }}>
            <Heart size={18} /> Wishlist
          </button>
          <button className="mobile-nav-link" onClick={() => { navigate('/cart'); setMobileOpen(false); }}>
            <ShoppingCart size={18} /> Cart {user?.cart?.length > 0 && <span className="mobile-cart-badge">{user.cart.length}</span>}
          </button>
          <button
            className="mobile-add-btn"
            onClick={() => { navigate('/add-item'); setMobileOpen(false); }}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      )}
    </header>
  );
}
