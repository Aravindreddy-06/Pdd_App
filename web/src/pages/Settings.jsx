import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Bell, Shield, HelpCircle, FileText,
  LogOut, ChevronRight, Eye, EyeOff, MapPin, Users,
  BarChart2, Lock, UserX, Download, Trash2, Check, X, CreditCard
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import PaymentMethodsManager from '../components/PaymentMethodsManager';
import './Settings.css';

// ── Reusable Toggle Switch ─────────────────────────────────────────────
function Toggle({ id, checked, onChange }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle-btn${checked ? ' toggle-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

// ── Default Privacy State ──────────────────────────────────────────────
const PRIVACY_DEFAULTS = {
  showProfile:        true,
  showLocation:       true,
  showActivity:       false,
  showBorrowHistory:  false,
  allowTagging:       true,
  showOnlineStatus:   true,
  dataAnalytics:      true,
  marketingEmails:    false,
};

function loadPrivacy() {
  try {
    const saved = localStorage.getItem('privacySettings');
    return saved ? { ...PRIVACY_DEFAULTS, ...JSON.parse(saved) } : PRIVACY_DEFAULTS;
  } catch {
    return PRIVACY_DEFAULTS;
  }
}

// ── Main Settings Component ────────────────────────────────────────────
export default function Settings() {
  const navigate  = useNavigate();
  const { user }  = useUser();

  const [showPrivacy, setShowPrivacy]     = useState(false);
  const [showPayments, setShowPayments]   = useState(false);
  const [privacy, setPrivacy]             = useState(loadPrivacy);
  const [savedBanner, setSavedBanner]     = useState(false);

  const updatePrivacy = (key, value) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    localStorage.setItem('privacySettings', JSON.stringify(updated));
  };

  const handleSavePrivacy = () => {
    localStorage.setItem('privacySettings', JSON.stringify(privacy));
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleResetPrivacy = () => {
    setPrivacy(PRIVACY_DEFAULTS);
    localStorage.setItem('privacySettings', JSON.stringify(PRIVACY_DEFAULTS));
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const menuSections = [
    {
      id: 'account',
      title: 'ACCOUNT SETTINGS',
      items: [
        { label: 'Edit Profile',             icon: User,       path: '/edit-profile', color: 'rgba(132,204,22,0.12)', iconColor: '#84cc16' },
        { label: 'Payment Methods & Billing', icon: CreditCard, path: 'payments',      color: 'rgba(132,204,22,0.12)', iconColor: '#84cc16', isPayments: true },
        { label: 'Notification Preferences', icon: Bell,       path: '#',             color: 'rgba(132,204,22,0.12)', iconColor: '#84cc16' },
        { label: 'Privacy Settings',         icon: Shield,     path: 'privacy',       color: 'rgba(132,204,22,0.12)', iconColor: '#84cc16', isPrivacy: true },
      ]
    },
    {
      id: 'support',
      title: 'SUPPORT & INFO',
      items: [
        { label: 'Help Center',     icon: HelpCircle, path: '/help-support', color: 'rgba(132,204,22,0.12)', iconColor: '#84cc16' },
        { label: 'Terms of Service', icon: FileText,  path: '/terms',        color: 'rgba(132,204,22,0.12)', iconColor: '#84cc16' },
      ]
    }
  ];

  const privacyToggles = [
    {
      group: 'PROFILE VISIBILITY',
      items: [
        { key: 'showProfile',       icon: Eye,       label: 'Public Profile',       desc: 'Allow others to view your profile and listings.' },
        { key: 'showLocation',      icon: MapPin,    label: 'Show Location',         desc: 'Display your neighbourhood on your profile.' },
        { key: 'showOnlineStatus',  icon: Users,     label: 'Online Status',         desc: 'Let neighbours see when you are active.' },
      ]
    },
    {
      group: 'ACTIVITY & HISTORY',
      items: [
        { key: 'showActivity',      icon: BarChart2, label: 'Activity Feed',         desc: 'Show your recent borrowing & lending activity.' },
        { key: 'showBorrowHistory', icon: Lock,      label: 'Borrow History',        desc: 'Allow neighbours to see items you have borrowed.' },
        { key: 'allowTagging',      icon: UserX,     label: 'Allow Tagging',         desc: 'Let other users tag you in community posts.' },
      ]
    },
    {
      group: 'DATA & COMMUNICATIONS',
      items: [
        { key: 'dataAnalytics',     icon: BarChart2, label: 'Usage Analytics',      desc: 'Help us improve by sharing anonymised usage data.' },
        { key: 'marketingEmails',   icon: FileText,  label: 'Marketing Emails',     desc: 'Receive news, tips, and offers from ResourceShare.' },
      ]
    }
  ];

  return (
    <div className="settings-page">
      {/* ── Sticky Header ─────────────────────────────── */}
      <div className="header-nav px-4 pt-6 pb-2">
        <button className="back-btn" onClick={() => { 
          if (showPrivacy) setShowPrivacy(false); 
          else if (showPayments) setShowPayments(false); 
          else navigate(-1); 
        }}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">{showPrivacy ? 'Privacy Settings' : showPayments ? 'Payment Methods' : 'Settings'}</h3>
        <div style={{ width: 24 }} />
      </div>

      {/* ── Saved banner ─────────────────────────────── */}
      {savedBanner && (
        <div className="saved-banner">
          <Check size={16} /> Settings saved
        </div>
      )}

      <div className="settings-content">

        {/* ── PRIVACY PANEL ───────────────────────────── */}
        {showPrivacy ? (
          <div className="privacy-panel">
            <p className="privacy-intro">
              Control who can see your information and how ResourceShare uses your data.
              Changes are saved automatically.
            </p>

            {privacyToggles.map(group => (
              <div key={group.group} className="privacy-group">
                <h4 className="privacy-group-title">{group.group}</h4>
                <div className="privacy-list">
                  {group.items.map(({ key, icon: Icon, label, desc }) => (
                    <div key={key} className="privacy-row">
                      <div className="privacy-row-left">
                        <div className="privacy-icon-wrap">
                          <Icon size={18} color="#84cc16" />
                        </div>
                        <div className="privacy-text">
                          <span className="privacy-label">{label}</span>
                          <span className="privacy-desc">{desc}</span>
                        </div>
                      </div>
                      <Toggle
                        id={key}
                        checked={privacy[key]}
                        onChange={val => updatePrivacy(key, val)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Danger Zone ─────────────────────────── */}
            <div className="privacy-group">
              <h4 className="privacy-group-title danger-title">DANGER ZONE</h4>
              <div className="privacy-list">
                <div className="privacy-row danger-row" onClick={() => alert('Data export requested. You will receive an email shortly.')}>
                  <div className="privacy-row-left">
                    <div className="privacy-icon-wrap danger-icon-wrap">
                      <Download size={18} color="#f59e0b" />
                    </div>
                    <div className="privacy-text">
                      <span className="privacy-label">Export My Data</span>
                      <span className="privacy-desc">Download all your data as a JSON file.</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                </div>
                <div className="privacy-row danger-row" onClick={() => { if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) navigate('/logout'); }}>
                  <div className="privacy-row-left">
                    <div className="privacy-icon-wrap delete-icon-wrap">
                      <Trash2 size={18} color="#ef4444" />
                    </div>
                    <div className="privacy-text">
                      <span className="privacy-label delete-label">Delete Account</span>
                      <span className="privacy-desc">Permanently delete your account and all data.</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                </div>
              </div>
            </div>

            {/* ── Action buttons ──────────────────────── */}
            <div className="privacy-actions">
              <button className="btn btn-primary" onClick={handleSavePrivacy}>
                <Check size={16} /> Save Changes
              </button>
              <button className="btn btn-outline" onClick={handleResetPrivacy}>
                Reset to Defaults
              </button>
            </div>
          </div>

        ) : showPayments ? (
          /* ── PAYMENTS PANEL ───────────────────────────── */
          <PaymentMethodsManager />
        ) : (
          /* ── MAIN SETTINGS MENU ──────────────────────── */
          <>
            {/* User Header */}
            <div className="settings-user-header">
              <div className="settings-avatar-wrapper">
                <img src={user?.avatar} alt={user?.name} className="settings-avatar" />
                <div className="edit-badge">
                  <User size={12} fill="white" color="white" />
                </div>
              </div>
              <h3 className="settings-user-name">{user?.name}</h3>
              <p className="settings-user-email">{user?.email || 'user@resourceshare.app'}</p>
            </div>

            {menuSections.map(section => (
              <div key={section.id} className="settings-section">
                <h4 className="settings-section-title">{section.title}</h4>
                <div className="settings-menu-list">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="settings-menu-item"
                      onClick={() => {
                        if (item.isPrivacy) {
                          setShowPrivacy(true);
                        } else if (item.isPayments) {
                          setShowPayments(true);
                        } else if (item.path !== '#') {
                          navigate(item.path);
                        }
                      }}
                    >
                      <div className="settings-item-left">
                        <div className="settings-icon-bg" style={{ backgroundColor: item.color }}>
                          <item.icon size={20} color={item.iconColor} />
                        </div>
                        <span className="settings-item-label">{item.label}</span>
                      </div>
                      <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Logout */}
            <div className="settings-logout-wrapper" onClick={() => navigate('/logout')}>
              <div className="settings-item-left">
                <div className="settings-icon-bg logout-bg">
                  <LogOut size={20} color="#ef4444" />
                </div>
                <span className="settings-item-label logout-label">Logout</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
