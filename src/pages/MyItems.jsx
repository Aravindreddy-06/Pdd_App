import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, ArrowRight, Trash2, Clock, Users, Award,
  TrendingUp, Eye, Star, MapPin, CheckCircle2, AlertCircle,
  RefreshCw, ChevronDown, BarChart2, Zap, Shield, X, Edit3
} from 'lucide-react';
import { useItems } from '../context/ItemContext';
import { useUser } from '../hooks/useUser';
import './MyItems.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80';

const INITIAL_BORROWING = [];

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

// Status config
const STATUS_CONFIG = {
  available:           { label: 'Available',   color: '#84cc16', bg: 'rgba(132,204,22,0.15)',  icon: CheckCircle2 },
  borrowed:            { label: 'Borrowed',    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  icon: Users },
  'due-soon':          { label: 'Due Soon',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  icon: AlertCircle },
  active:              { label: 'Active',      color: '#84cc16', bg: 'rgba(132,204,22,0.15)',  icon: CheckCircle2 },
  'extension-pending': { label: 'Ext. Pending',color: '#a78bfa', bg: 'rgba(167,139,250,0.15)',icon: RefreshCw },
};

function getStatus(raw = 'available') {
  const key = raw.toLowerCase().replace(/\s+/g, '-');
  return STATUS_CONFIG[key] || STATUS_CONFIG.available;
}

export default function MyItems() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { items, removeItem: removeFromMarket, updateItem } = useItems();
  const [activeTab, setActiveTab] = useState('published');
  const [deleteModal, setDeleteModal] = useState(null); // { id, title, type }
  const [editModalItem, setEditModalItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', category: '', condition: 'Good', description: '', isFree: false });
  const [expandedId, setExpandedId] = useState(null);

  const [borrowingItems, setBorrowingItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rs_borrowing_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('rs_borrowing_items', JSON.stringify(borrowingItems));
  }, [borrowingItems]);

  const lendingItems = items.filter(item =>
    !item.owner ||
    item.owner === (user?.name?.split(' ')[0] || user?.name) ||
    item.owner === 'Me' ||
    item.owner === 'Local Neighbor'
  );

  const activeLendingItems = lendingItems.filter(item => 
    item.status === 'borrowed' || item.status === 'Active' || item.status === 'Borrowed'
  );

  const totalViews  = Number(user?.profileViews) || 0;
  const earned      = Number(user?.totalEarned) || 0;
  const helpedCount = Number(user?.helpedCount) || 0;
  const trustScore  = user?.rating ? Number(user.rating).toFixed(1) : '5.0';

  const animatedItems    = useCounter(lendingItems.length, 800);
  const animatedHelped   = useCounter(helpedCount, 1000);
  const animatedEarned   = useCounter(earned, 1200);

  const confirmDelete = (id, title, type) => setDeleteModal({ id, title, type });

  const executeDelete = () => {
    if (!deleteModal) return;
    if (deleteModal.type === 'published' || deleteModal.type === 'lending') {
      removeFromMarket(deleteModal.id);
    } else {
      setBorrowingItems(prev => prev.filter(i => i.id !== deleteModal.id));
    }
    setDeleteModal(null);
  };

  const openEditModal = (item) => {
    setEditModalItem(item);
    const rawPrice = item.price ? item.price.replace(/[^\d]/g, '') : '';
    setEditForm({
      title: item.title || '',
      price: rawPrice,
      category: item.category || 'tools',
      condition: item.condition || 'Good',
      description: item.description || '',
      isFree: item.price === 'Free' || rawPrice === '0'
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModalItem) return;
    updateItem(editModalItem.id, {
      title: editForm.title,
      price: editForm.isFree ? 'Free' : `₹${editForm.price}/day`,
      category: editForm.category,
      condition: editForm.condition,
      description: editForm.description
    });
    setEditModalItem(null);
  };

  const extendBorrowing = (id) => {
    setBorrowingItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, status: 'Extension Pending', dueDate: 'Requested' }
        : item
    ));
  };

  const returnItem = (id) => {
    setBorrowingItems(prev => prev.filter(i => i.id !== id));
  };

  const displayItems = activeTab === 'published' 
    ? lendingItems 
    : activeTab === 'lending' 
      ? activeLendingItems 
      : borrowingItems;

  const hasActivity = (
    lendingItems.length > 0 || 
    borrowingItems.length > 0 || 
    Number(user?.borrowed || 0) > 0 || 
    Number(user?.shared || 0) > 0 || 
    Number(user?.helpedCount || 0) > 0 ||
    Boolean(user?.isVerified)
  );

  return (
    <div className="my-items-page">

      {/* ── Hero Stats Bar ─────────────────────────────────── */}
      <div className="mi-hero">
        <div className="mi-hero-inner">
          <div className="mi-hero-left">
            <div className="mi-hero-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=84cc16&color=000&bold=true&size=80`}
                alt="avatar"
              />
              <div className="mi-hero-online-dot" />
            </div>
            <div>
              <p className="mi-hero-greeting">Welcome back,</p>
              <h1 className="mi-hero-name">{user?.name?.split(' ')[0] || 'Neighbor'} 👋</h1>
              {hasActivity && (
                <div className="mi-hero-badges">
                  <span className="mi-badge"><Shield size={11} /> Verified</span>
                  <span className="mi-badge mi-badge-gold"><Star size={11} /> {trustScore}/5 Trust</span>
                </div>
              )}
            </div>
          </div>
          <button className="mi-add-btn" onClick={() => navigate('/add-item')}>
            <Plus size={18} />
            <span>List Item</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="mi-stats-row">
          <div className="mi-stat-card">
            <div className="mi-stat-icon" style={{ color: '#84cc16' }}><Package size={20} /></div>
            <div className="mi-stat-val">{animatedItems}</div>
            <div className="mi-stat-label">Items Listed</div>
          </div>
          <div className="mi-stat-card">
            <div className="mi-stat-icon" style={{ color: '#3b82f6' }}><Users size={20} /></div>
            <div className="mi-stat-val">{animatedHelped}</div>
            <div className="mi-stat-label">Neighbors Helped</div>
          </div>
          <div className="mi-stat-card">
            <div className="mi-stat-icon" style={{ color: '#f59e0b' }}><TrendingUp size={20} /></div>
            <div className="mi-stat-val">₹{animatedEarned}</div>
            <div className="mi-stat-label">Total Earned</div>
          </div>
          <div className="mi-stat-card">
            <div className="mi-stat-icon" style={{ color: '#a78bfa' }}><Eye size={20} /></div>
            <div className="mi-stat-val">{totalViews}</div>
            <div className="mi-stat-label">Profile Views</div>
          </div>
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────── */}
      <div className="mi-content">

        {/* Tabs */}
        <div className="mi-tabs">
          <button
            className={`mi-tab ${activeTab === 'published' ? 'active' : ''}`}
            onClick={() => setActiveTab('published')}
          >
            <Package size={15} /> Items Published
            <span className="mi-tab-count">{lendingItems.length}</span>
          </button>
          <button
            className={`mi-tab ${activeTab === 'lending' ? 'active' : ''}`}
            onClick={() => setActiveTab('lending')}
          >
            <Zap size={15} /> Active Lending
            <span className="mi-tab-count">{activeLendingItems.length}</span>
          </button>
          <button
            className={`mi-tab ${activeTab === 'borrowing' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowing')}
          >
            <RefreshCw size={15} /> Borrowing
            <span className="mi-tab-count">{borrowingItems.length}</span>
          </button>
        </div>

        {/* Grid */}
        {displayItems.length === 0 ? (
          <div className="mi-empty">
            <div className="mi-empty-icon-wrap">
              <Package size={44} strokeWidth={1.2} />
            </div>
            <h3>Nothing here yet</h3>
            <p>
              {activeTab === 'published'
                ? 'You have not published any items yet. List your first item and start earning from your neighborhood.'
                : activeTab === 'lending'
                  ? 'No active lendings currently in progress.'
                  : 'Browse the marketplace and borrow something useful today.'}
            </p>
            <button
              className="mi-empty-btn"
              onClick={() => navigate(activeTab === 'borrowing' ? '/explore' : '/add-item')}
            >
              {activeTab === 'borrowing' ? 'Explore Items' : 'Start Sharing'}
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="mi-grid">
            {displayItems.map(item => {
              const cfg = getStatus(item.status);
              const StatusIcon = cfg.icon;
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`mi-card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  {/* Image */}
                  <div className="mi-card-img-wrap">
                    <img
                      src={item.image || item.img || DEFAULT_IMAGE}
                      alt={item.title}
                      className="mi-card-img"
                      onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                    />
                    {/* Gradient overlay */}
                    <div className="mi-img-overlay" />

                    {/* Status badge */}
                    <div
                      className="mi-status-badge"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                    >
                      <StatusIcon size={11} />
                      {cfg.label}
                    </div>

                    {/* Category */}
                    <div className="mi-category-badge">{item.category || 'General'}</div>

                    {/* Quick rating */}
                    {item.rating && (
                      <div className="mi-rating-badge">
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        {item.rating}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="mi-card-body">
                    <div className="mi-card-top">
                      <h4 className="mi-card-title">{item.title}</h4>
                      <span className="mi-card-price">{item.price}</span>
                    </div>

                    <div className="mi-card-meta">
                      {item.distance && (
                        <span className="mi-meta-pill"><MapPin size={11} />{item.distance}</span>
                      )}
                      {item.owner && activeTab === 'borrowing' && (
                        <span className="mi-meta-pill"><Users size={11} />{item.owner}</span>
                      )}
                      {item.dueDate && (
                        <span
                          className="mi-meta-pill"
                          style={item.dueDate === 'Today' ? { color: '#f59e0b', borderColor: '#f59e0b40' } : {}}
                        >
                          <Clock size={11} />
                          Due {item.dueDate}
                        </span>
                      )}
                    </div>

                    {/* Expand chevron */}
                    <div className="mi-expand-hint">
                      <ChevronDown
                        size={16}
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                          color: 'var(--text-light)'
                        }}
                      />
                    </div>

                    {/* Expanded actions */}
                    {isExpanded && (
                      <div className="mi-card-actions" onClick={e => e.stopPropagation()}>
                        {activeTab === 'published' ? (
                          <>
                            <button
                              className="mi-btn mi-btn-primary"
                              onClick={() => navigate(`/item/${item.id}`)}
                            >
                              <Eye size={15} /> View
                            </button>
                            <button
                              className="mi-btn mi-btn-ghost"
                              onClick={() => openEditModal(item)}
                            >
                              <Edit3 size={15} /> Edit Item
                            </button>
                            <button
                              className="mi-btn mi-btn-danger"
                              onClick={() => confirmDelete(item.id, item.title, 'published')}
                            >
                              <Trash2 size={15} /> Delete
                            </button>
                          </>
                        ) : activeTab === 'lending' ? (
                          <>
                            <button
                              className="mi-btn mi-btn-primary"
                              onClick={() => navigate(`/item/${item.id}`)}
                            >
                              <Eye size={15} /> View Listing
                            </button>
                            <button
                              className="mi-btn mi-btn-ghost"
                              onClick={() => openEditModal(item)}
                            >
                              <Edit3 size={15} /> Edit
                            </button>
                            <button
                              className="mi-btn mi-btn-danger"
                              onClick={() => confirmDelete(item.id, item.title, 'lending')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="mi-btn mi-btn-primary"
                              onClick={() => extendBorrowing(item.id)}
                            >
                              <RefreshCw size={15} /> Extend
                            </button>
                            <button
                              className="mi-btn mi-btn-ghost"
                              onClick={() => returnItem(item.id)}
                            >
                              <CheckCircle2 size={15} /> Return
                            </button>
                            <button
                              className="mi-btn mi-btn-danger"
                              onClick={() => confirmDelete(item.id, item.title, 'borrowing')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics teaser */}
        {(activeTab === 'published' || activeTab === 'lending') && lendingItems.length > 0 && (
          <div className="mi-analytics-card" onClick={() => navigate('/impact')}>
            <div className="mi-analytics-left">
              <BarChart2 size={28} color="var(--primary)" />
              <div>
                <h4>View Full Analytics</h4>
                <p>Track earnings, views & community impact in detail.</p>
              </div>
            </div>
            <ArrowRight size={20} color="var(--primary)" />
          </div>
        )}
      </div>

      {/* ── Edit Published Item Modal ──────────────────────── */}
      {editModalItem && (
        <div className="mi-modal-overlay" onClick={() => setEditModalItem(null)}>
          <div className="mi-modal p-6 max-w-lg w-full" onClick={e => e.stopPropagation()} style={{ background: 'var(--grad-dark)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <button className="mi-modal-close" onClick={() => setEditModalItem(null)}>
              <X size={18} />
            </button>
            <div className="mi-modal-icon mb-3">
              <Edit3 size={28} color="var(--primary)" />
            </div>
            <h3 className="text-white text-xl font-bold mb-1">Edit Published Item</h3>
            <p className="text-gray-400 text-xs mb-4">Update the details for "{editModalItem.title}"</p>
            
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Item Title</label>
                <input 
                  type="text" 
                  className="input-field w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-primary"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-300 block mb-1">Category</label>
                  <select 
                    className="input-field w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700"
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="tools">Tools & DIY</option>
                    <option value="electronics">Electronics</option>
                    <option value="sports">Sports & Outdoors</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books & Media</option>
                    <option value="party">Party & Events</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-300 block mb-1">Condition</label>
                  <select 
                    className="input-field w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700"
                    value={editForm.condition}
                    onChange={e => setEditForm({ ...editForm, condition: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-300">Price per day (₹)</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editForm.isFree}
                      onChange={e => setEditForm({ ...editForm, isFree: e.target.checked, price: e.target.checked ? '0' : editForm.price })}
                    />
                    <span className="text-xs font-bold text-primary">Free Listing</span>
                  </label>
                </div>
                {!editForm.isFree && (
                  <input 
                    type="number" 
                    className="input-field w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700"
                    placeholder="Enter daily rate in ₹"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    required={!editForm.isFree}
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Description</label>
                <textarea 
                  className="input-field w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 min-h-[90px]"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                ></textarea>
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary flex-1 py-3 rounded-xl font-bold">
                  Save Changes
                </button>
                <button type="button" className="btn btn-light flex-1 py-3 rounded-xl" onClick={() => setEditModalItem(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {deleteModal && (
        <div className="mi-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="mi-modal" onClick={e => e.stopPropagation()}>
            <button className="mi-modal-close" onClick={() => setDeleteModal(null)}>
              <X size={18} />
            </button>
            <div className="mi-modal-icon">
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h3>Remove Published Item?</h3>
            <p>
              <strong>"{deleteModal.title}"</strong> will be{' '}
              {deleteModal.type === 'published' || deleteModal.type === 'lending'
                ? 'permanently removed from your published list and the public marketplace.'
                : 'removed from your borrowed list.'}
            </p>
            <div className="mi-modal-actions">
              <button className="mi-btn mi-btn-danger w-full" onClick={executeDelete}>
                Yes, Delete Item
              </button>
              <button className="mi-btn mi-btn-ghost w-full" onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
