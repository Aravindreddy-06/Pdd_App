import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Package, Users, Plus, Search,
  Edit2, Trash2, Eye, X, Check, AlertTriangle, TrendingUp,
  ShoppingBag, Star, ChevronRight, Loader, Sparkles,
  Wrench, Monitor, Coffee, Tent, PartyPopper, LayoutGrid
} from 'lucide-react';
import { ALL_ITEMS as STATIC_ITEMS } from '../data/items';
import './AdminDashboard.css';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ResourceShareadmin@gmail.com').toLowerCase().trim();
const CATEGORIES = ['Tools', 'Electronics', 'Kitchen', 'Outdoors', 'Party', 'Furniture', 'Decor', 'Other'];

const CATEGORY_MAP = [
  { id: 'All', icon: LayoutGrid },
  { id: 'Tools', icon: Wrench },
  { id: 'Electronics', icon: Monitor },
  { id: 'Kitchen', icon: Coffee },
  { id: 'Outdoors', icon: Tent },
  { id: 'Party', icon: PartyPopper }
];

const EMPTY_ITEM = { title: '', price: '', category: 'Electronics', description: '', img: '', owner: 'Admin', rating: '4.5' };

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`admin-toast ${type}`}>
      {type === 'success' ? <Check size={16} color="#22c55e" /> : <AlertTriangle size={16} color="#ef4444" />}
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { type: 'add'|'edit'|'delete'|'viewUser', data }
  const [form, setForm] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    // Initial load for items
    setItems(STATIC_ITEMS.map(i => ({ ...i, isStatic: true, owner: i.owner || 'System' })));
    
    // Initial load for users
    setUsers([
      { id: 'admin-1', name: 'Admin User', email: ADMIN_EMAIL, role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=84cc16&color=fff' },
      { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'user', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=84cc16&color=fff' }
    ]);
  }, []);

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <div className="admin-denied-icon"><Shield size={40} color="#ef4444" /></div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-gray)', maxWidth: '320px' }}>
          You don't have permission to access this page. Please log in as an administrator.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>Go Home</button>
      </div>
    );
  }

  const filteredItems = items.filter(i => {
    const matchesSearch = 
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || i.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── CRUD ──────────────────────────────────────────────────────────────
  const handleSaveItem = async () => {
    if (!form.title || !form.price) return showToast('Title and Price are required.', 'error');
    setSaving(true);
    try {
      if (modal.type === 'add') {
        const newItem = { ...form, id: 'mock-' + Date.now(), createdAt: new Date().toISOString() };
        setItems(prev => [newItem, ...prev]);
        showToast('Item added successfully!');
      } else {
        const { id } = form;
        setItems(prev => prev.map(item => item.id === id ? { ...form } : item));
        showToast('Item updated successfully!');
      }
      setModal(null);
    } catch (e) {
      showToast('Failed to save item.', 'error');
    }
    setSaving(false);
  };

  const handleDeleteItem = async (item) => {
    setSaving(true);
    try {
      setItems(prev => prev.filter(i => i.id !== item.id));
      showToast('Item deleted.');
      setModal(null);
    } catch (e) {
      showToast('Failed to delete item.', 'error');
    }
    setSaving(false);
  };

  const handleDeleteUser = async (uid) => {
    setSaving(true);
    try {
      setUsers(prev => prev.filter(u => u.uid !== uid));
      showToast('User removed.');
      setModal(null);
    } catch (e) {
      showToast('Failed to remove user.', 'error');
    }
    setSaving(false);
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Items', num: items.length, icon: Package, color: '#22c55e', bg: '#dcfce7' },
    { label: 'Total Users', num: users.length, icon: Users, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Categories', num: [...new Set(items.map(i => i.category))].length, icon: LayoutDashboard, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Avg Rating', num: items.length ? (items.reduce((a, i) => a + parseFloat(i.rating || 0), 0) / items.length).toFixed(1) : '–', icon: Star, color: '#ec4899', bg: '#fdf2f8' },
  ];

  // ── Sidebar nav items ───────────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'items', label: 'Manage Items', icon: Package, count: items.length },
    { id: 'users', label: 'Manage Users', icon: Users, count: users.length },
  ];

  return (
    <div className="admin-page">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-badge"><Shield size={12} /> Admin Panel</div>
          <div className="admin-sidebar-title">ResourceShare</div>
          <div className="admin-sidebar-sub">{user?.email}</div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-section">Navigation</div>
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button key={id} className={`admin-nav-btn ${tab === id ? 'active' : ''}`} onClick={() => { setTab(id); setSearch(''); }}>
              <Icon size={18} />{label}
              {count !== undefined && <span className="nav-count">{count}</span>}
            </button>
          ))}
          <div className="admin-nav-section" style={{ marginTop: 16 }}>App</div>
          <button className="admin-nav-btn" onClick={() => navigate('/home')}><ChevronRight size={18} />Back to App</button>
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <>
            <div className="admin-page-header">
              <div>
                <div className="admin-page-title">Welcome back, Admin 👋</div>
                <div className="admin-page-sub">Here's what's happening in ResourceShare today.</div>
              </div>
            </div>
            <div className="admin-stats">
              {stats.map(({ label, num, icon: Icon, color, bg }) => (
                <div className="admin-stat-card" key={label}>
                  <div className="admin-stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
                  <div className="admin-stat-num">{num}</div>
                  <div className="admin-stat-label">{label}</div>
                  <div className="admin-stat-trend">↑ Live data</div>
                </div>
              ))}
            </div>
            {/* Recent Items preview */}
            <div className="admin-block">
              <div className="admin-block-header">
                <div className="admin-block-title">Recent Items</div>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('items')}><Eye size={14} /> View All</button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Rating</th><th>Actions</th></tr></thead>
                  <tbody>
                    {items.slice(0, 5).map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setModal({ type: 'view', data: item })}>
                            <img src={item.img || item.image || 'https://via.placeholder.com/48'} alt={item.title} className="admin-item-img" onError={e => e.target.src = 'https://via.placeholder.com/48'} />
                            <div className="admin-item-title">{item.title}</div>
                          </div>
                        </td>
                        <td><span className="admin-badge admin-badge-blue">{item.category}</span></td>
                        <td style={{ fontWeight: 700 }}>{item.price}</td>
                        <td>⭐ {item.rating}</td>
                        <td>
                          <button className="admin-action-btn view" title="View Details" onClick={() => setModal({ type: 'view', data: item })}>
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Items Tab */}
        {tab === 'items' && (
          <>
            <div className="admin-page-header">
              <div>
                <div className="admin-page-title">Manage Items</div>
                <div className="admin-page-sub">{items.length} total items in the platform</div>
              </div>
              <button className="btn btn-primary" onClick={() => { setForm(EMPTY_ITEM); setModal({ type: 'add' }); }}>
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Category Filter Strip */}
            <div className="admin-category-strip">
              {CATEGORY_MAP.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button 
                    key={cat.id} 
                    className={`admin-cat-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <Icon size={20} />
                    <span>{cat.id}</span>
                  </button>
                );
              })}
            </div>

            <div className="admin-block" style={{ marginBottom: 24, padding: 20 }}>
              <div className="admin-search-bar" style={{ maxWidth: '100%' }}>
                <Search size={16} color="var(--text-gray)" />
                <input placeholder="Search items by name or category..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {selectedCategory === 'All' ? (
              CATEGORIES.map(cat => {
                const catItems = filteredItems.filter(i => i.category?.toLowerCase() === cat.toLowerCase());
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="admin-category-section">
                    <div className="admin-category-header">
                      <div className="admin-category-title">{cat}</div>
                      <div className="admin-badge admin-badge-blue" style={{ borderRadius: 8 }}>{catItems.length}</div>
                      <div className="admin-category-line"></div>
                    </div>
                    
                    <div className="admin-block">
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Price</th>
                              <th>Rating</th>
                              <th>Owner</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catItems.map(item => (
                              <tr key={item.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setModal({ type: 'view', data: item })}>
                                  <img 
                                    src={item.img || item.image || 'https://via.placeholder.com/48'} 
                                    alt={item.title} 
                                    className="admin-item-img" 
                                    onError={e => e.target.src = 'https://via.placeholder.com/48'} 
                                  />
                                  <div>
                                    <div className="admin-item-title">{item.title}</div>
                                    <div className="admin-item-cat">{item.description?.slice(0, 40)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700 }}>{item.price}</td>
                              <td>⭐ {item.rating}</td>
                              <td>{item.owner || '—'}</td>
                              <td>
                                <div className="admin-actions">
                                  <button className="admin-action-btn view" title="View Details" onClick={() => setModal({ type: 'view', data: item })}>
                                    <Eye size={14} />
                                  </button>
                                  {!item.isStatic ? (
                                    <>
                                      <button className="admin-action-btn edit" title="Edit" onClick={() => { setForm({ ...item }); setModal({ type: 'edit', data: item }); }}>
                                        <Edit2 size={14} />
                                      </button>
                                      <button className="admin-action-btn delete" title="Delete" onClick={() => setModal({ type: 'delete', data: item })}>
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="admin-badge admin-badge-gray" style={{ fontSize: '10px' }}>Read Only</span>
                                  )}
                                </div>
                              </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="admin-category-section">
                <div className="admin-category-header">
                  <div className="admin-category-title">{selectedCategory}</div>
                  <div className="admin-badge admin-badge-blue" style={{ borderRadius: 8 }}>{filteredItems.length}</div>
                  <div className="admin-category-line"></div>
                </div>
                
                <div className="admin-block">
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Price</th>
                          <th>Rating</th>
                          <th>Owner</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setModal({ type: 'view', data: item })}>
                                <img 
                                  src={item.img || item.image || 'https://via.placeholder.com/48'} 
                                  alt={item.title} 
                                  className="admin-item-img" 
                                  onError={e => e.target.src = 'https://via.placeholder.com/48'} 
                                />
                                <div>
                                  <div className="admin-item-title">{item.title}</div>
                                  <div className="admin-item-cat">{item.description?.slice(0, 40)}...</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 700 }}>{item.price}</td>
                            <td>⭐ {item.rating}</td>
                            <td>{item.owner || '—'}</td>
                            <td>
                              <div className="admin-actions">
                                <button className="admin-action-btn view" title="View Details" onClick={() => setModal({ type: 'view', data: item })}>
                                  <Eye size={14} />
                                </button>
                                {!item.isStatic ? (
                                  <>
                                    <button className="admin-action-btn edit" title="Edit" onClick={() => { setForm({ ...item }); setModal({ type: 'edit', data: item }); }}>
                                      <Edit2 size={14} />
                                    </button>
                                    <button className="admin-action-btn delete" title="Delete" onClick={() => setModal({ type: 'delete', data: item })}>
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <span className="admin-badge admin-badge-gray" style={{ fontSize: '10px' }}>Read Only</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="admin-block" style={{ padding: 48, textAlign: 'center' }}>
                <Package size={40} color="var(--text-light)" style={{ marginBottom: 16 }} />
                <div style={{ color: 'var(--text-gray)' }}>No items found matching your search.</div>
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <>
            <div className="admin-page-header">
              <div>
                <div className="admin-page-title">Manage Users</div>
                <div className="admin-page-sub">{users.length} registered users</div>
              </div>
            </div>
            <div className="admin-block">
              <div className="admin-block-header">
                <div className="admin-block-title">All Users</div>
                <div className="admin-search-bar">
                  <Search size={16} color="var(--text-gray)" />
                  <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.uid}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=84cc16&color=fff`} alt={u.name} className="admin-user-avatar" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=84cc16&color=fff`} />
                            <div>
                              <div className="admin-user-name">{u.name || 'Unknown'}</div>
                              <div className="admin-user-email">UID: {u.uid?.slice(0, 12)}...</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email || u.contact || '—'}</td>
                        <td>
                          <span className={`admin-badge ${u.role === 'admin' || u.email?.toLowerCase().trim() === ADMIN_EMAIL ? 'admin-badge-orange' : 'admin-badge-green'}`}>
                            {u.role === 'admin' || u.email?.toLowerCase().trim() === ADMIN_EMAIL ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn view" title="View" onClick={() => setModal({ type: 'viewUser', data: u })}><Eye size={14} /></button>
                            {(u.role !== 'admin' && u.email?.toLowerCase().trim() !== ADMIN_EMAIL) && (
                              <button className="admin-action-btn delete" title="Remove" onClick={() => setModal({ type: 'deleteUser', data: u })}><Trash2 size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-gray)' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Add / Edit Item Modal ── */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div className="admin-modal-title">{modal.type === 'add' ? 'Add New Item' : 'Edit Item'}</div>
              <button className="admin-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title *</label>
                  <input className="admin-form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Item title" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price *</label>
                  <input className="admin-form-input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. ₹10/day" />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select className="admin-form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Rating</label>
                  <input className="admin-form-input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Image URL</label>
                <input className="admin-form-input" value={form.img} onChange={e => setForm(p => ({ ...p, img: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Owner</label>
                <input className="admin-form-input" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} placeholder="Owner name" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Item description..." />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveItem} disabled={saving}>
                {saving ? <><Loader size={14} className="spinning" /> Saving...</> : <><Check size={14} /> {modal.type === 'add' ? 'Add Item' : 'Save Changes'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Item Confirm ── */}
      {modal?.type === 'delete' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-delete-modal">
            <div className="admin-delete-icon"><Trash2 size={28} color="#ef4444" /></div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 8 }}>Delete Item?</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: 24 }}>
              Are you sure you want to delete <strong>"{modal.data?.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleDeleteItem(modal.data)} disabled={saving}>
                {saving ? <Loader size={14} className="spinning" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Item Modal ── */}
      {modal?.type === 'view' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal animate-in" style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">Item Analysis</div>
              <button className="admin-modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-img-wrap">
                  <img 
                    src={modal.data.img || modal.data.image || 'https://via.placeholder.com/400'} 
                    alt={modal.data.title} 
                    className="admin-detail-img"
                  />
                </div>
                
                <div className="admin-detail-header-info">
                  <h2 className="admin-detail-item-title">{modal.data.title}</h2>
                  <span className="admin-badge admin-badge-blue" style={{ padding: '6px 12px', fontSize: '12px' }}>{modal.data.category}</span>
                </div>

                <div className="admin-detail-info-grid">
                  <div className="admin-detail-row">
                    <div className="admin-detail-label">Daily Price</div>
                    <div className="admin-detail-value" style={{ color: 'var(--primary)', fontSize: '20px' }}>{modal.data.price}</div>
                  </div>
                  <div className="admin-detail-row">
                    <div className="admin-detail-label">Current Owner</div>
                    <div className="admin-detail-value">{modal.data.owner || 'System'}</div>
                  </div>
                  <div className="admin-detail-row">
                    <div className="admin-detail-label">Trust Score</div>
                    <div className="admin-detail-value">⭐ {modal.data.rating} / 5.0</div>
                  </div>
                  <div className="admin-detail-row">
                    <div className="admin-detail-label">Availability</div>
                    <div className="admin-detail-value">{modal.data.location?.address || 'Primary Zone'}</div>
                  </div>
                </div>

                <div className="admin-detail-section">
                  <div className="admin-detail-section-title">
                    <Shield size={14} /> Description & Context
                  </div>
                  <p className="admin-detail-description">
                    {modal.data.description || 'No detailed description provided. This item is currently active in the marketplace and available for neighborhood borrowing.'}
                  </p>
                </div>

                {modal.data.features && modal.data.features.length > 0 && (
                  <div className="admin-detail-section">
                    <div className="admin-detail-section-title">
                      <Sparkles size={14} /> Verified Features
                    </div>
                    <div className="admin-detail-tags">
                      {modal.data.features.map((f, i) => (
                        <span key={i} className="admin-badge admin-badge-gray" style={{ fontSize: '11px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button className="btn btn-outline w-full" style={{ borderRadius: '12px', height: '48px' }} onClick={() => setModal(null)}>Dismiss Details</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View User Modal ── */}
      {modal?.type === 'viewUser' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div className="admin-modal-title">User Details</div>
              <button className="admin-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal-body" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 32 }}>
              <img src={modal.data?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(modal.data?.name || 'User')}&background=84cc16&color=fff`} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
              <div style={{ fontSize: 20, fontWeight: 800 }}>{modal.data?.name || 'Unknown'}</div>
              <div style={{ color: 'var(--text-gray)' }}>{modal.data?.email || '—'}</div>
              <span className={`admin-badge ${modal.data?.role === 'admin' || modal.data?.email?.toLowerCase().trim() === ADMIN_EMAIL ? 'admin-badge-orange' : 'admin-badge-green'}`}>
                {modal.data?.role === 'admin' || modal.data?.email?.toLowerCase().trim() === ADMIN_EMAIL ? '👑 Admin' : '👤 User'}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', marginTop: 16 }}>
                {[['UID', modal.data?.uid?.slice(0, 20) + '...'], ['Phone', modal.data?.phone || '—'], ['Location', modal.data?.location || '—'], ['Joined', modal.data?.lastLogin ? new Date(modal.data.lastLogin).toLocaleDateString() : '—']].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg-color)', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-gray)', fontWeight: 700, marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete User Confirm ── */}
      {modal?.type === 'deleteUser' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-delete-modal">
            <div className="admin-delete-icon"><Trash2 size={28} color="#ef4444" /></div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 8 }}>Remove User?</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: 24 }}>
              Remove <strong>"{modal.data?.name}"</strong> from the database? Their auth account will remain.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleDeleteUser(modal.data.uid)} disabled={saving}>
                {saving ? <Loader size={14} className="spinning" /> : <Trash2 size={14} />} Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
