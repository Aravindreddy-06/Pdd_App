import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MapPin, Star, ShieldCheck, Truck, ChevronRight, Loader, Edit3, Trash2, X, Check } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useItems, isItemOwner } from '../context/ItemContext';
import './ItemDetails.css';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWishlist, addToCart } = useUser();
  const { items, loading, updateItem, removeItem } = useItems();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const item = items.find(i => i.id === id || i.id?.toString() === id?.toString() || i.id === parseInt(id));
  
  if (loading) return <div className="p-10 text-center"><Loader className="spinning" /></div>;
  if (!item) return <div className="p-10 text-center"><h3>Item not found</h3><button className="btn btn-primary mt-4" onClick={() => navigate('/home')}>Back to Home</button></div>;

  const isOwner = isItemOwner(item, user);
  const isLiked = user?.wishlist?.some(w => w.id === item.id);
  const isInCart = user?.cart?.some(c => c.id === item.id);

  // Edit form state
  const rawPrice = item.price ? item.price.replace(/[^\d]/g, '') : '';
  const [editForm, setEditForm] = useState({
    title: item.title || '',
    price: rawPrice,
    category: item.category || 'General',
    description: item.description || '',
    isFree: item.price === 'Free' || rawPrice === '0'
  });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateItem(item.id, {
      title: editForm.title,
      price: editForm.isFree ? 'Free' : `₹${editForm.price}/day`,
      category: editForm.category,
      description: editForm.description
    });
    setShowEditModal(false);
  };

  const handleDeleteItem = () => {
    removeItem(item.id);
    setShowDeleteModal(false);
    navigate('/my-items');
  };

  // Use the item's images array if available; otherwise use the single image
  const itemImages = item.images && item.images.length > 0
    ? item.images
    : [item.img || item.image].filter(Boolean);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isInCart) {
      addToCart(item);
    } else {
      navigate('/cart');
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleWishlist(item);
  };

  return (
    <div className="product-page">
      <div className="product-header-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <button className="back-btn" onClick={handleLike}>
          <Heart size={24} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'var(--text-dark)'} />
        </button>
      </div>

      <div className="product-container">
        {/* Left Column: Images */}
        <div className="product-gallery">
          <div className="main-image-container">
            <img 
              key={activeImageIndex} 
              src={itemImages[activeImageIndex] || item.img || item.image} 
              alt={item.title} 
              className="main-image" 
            />
          </div>
          {itemImages.length > 0 && (
            <div className="thumbnail-list">
              {itemImages.map((imgUrl, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={imgUrl} alt={`thumb-${index}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle Column: Details */}
        <div className="product-details">
          <div className="product-brand">{item.category}</div>
          <h1 className="product-title">{item.title}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((starIdx) => (
                <Star 
                  key={starIdx}
                  size={16} 
                  fill={starIdx <= Math.round(Number(item.rating) || 0) ? "#f59e0b" : "none"} 
                  color={starIdx <= Math.round(Number(item.rating) || 0) ? "#f59e0b" : "#6b7280"} 
                />
              ))}
            </div>
            <span className="rating-score">{Number(item.rating || 0) > 0 ? Number(item.rating).toFixed(1) : '0.0'}</span>
            <span className="rating-count">{item.ratingCount ? `${item.ratingCount} rating(s)` : 'No ratings yet'}</span>
          </div>

          <div className="product-price-section">
            <span className="price-label">Rental Price</span>
            <div className="price-display">{item.price}</div>
            <p className="price-sub">Inclusive of all taxes</p>
          </div>

          <div className="product-offers">
            <div className="offer-tag"><ShieldCheck size={16}/> ResourceShare Guarantee</div>
            <div className="offer-tag"><MapPin size={16}/> Local Pickup</div>
          </div>

          <div className="product-description-box">
            <h3>About this item</h3>
            <p>{item.description || 'A great item ready to be borrowed from your trusted neighbor. This item has been verified for quality and safety.'}</p>
            {item.features && (
              <ul className="feature-list">
                {item.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
            )}
          </div>
          
          <div className="owner-section mt-6">
            <h3>Provided by</h3>
            <div className="owner-card-premium" onClick={() => navigate('/profile')}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.owner || 'Neighbor')}&background=84cc16&color=fff`} alt="Owner" className="owner-avatar" />
              <div className="owner-info">
                <h4>{item.owner} {isOwner && '(You)'}</h4>
                <p>Verified Neighbor • 2 years</p>
              </div>
              <ChevronRight size={20} color="var(--text-gray)" />
            </div>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className="product-buy-box">
          <div className="buy-box-inner">
            <div className="buy-box-price">{item.price}</div>
            <div className="delivery-info">
              <Truck size={18} color="var(--primary)" />
              <span>Available for pickup today at <strong>{item.distance}</strong></span>
            </div>
            
            <div className="stock-status">In Stock</div>
            
            <div className="seller-info">
              Sold by <strong>{item.owner}</strong> and Fulfilled by <strong>ResourceShare</strong>.
            </div>

            {isOwner ? (
              <div className="owner-action-box p-4 mt-3" style={{ background: 'var(--primary-lightest)', borderRadius: '14px', border: '1px solid var(--primary-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-dark)', display: 'block' }}>
                  🛡️ You listed this item
                </span>
                <button 
                  className="btn btn-primary w-full flex-row items-center justify-center gap-2" 
                  onClick={() => setShowEditModal(true)}
                  style={{ borderRadius: '10px', height: '44px', fontWeight: 700 }}
                >
                  <Edit3 size={16} /> Edit Item Settings
                </button>
                <button 
                  className="btn btn-outline w-full flex-row items-center justify-center gap-2" 
                  onClick={() => setShowDeleteModal(true)}
                  style={{ borderRadius: '10px', height: '44px', color: '#ef4444', borderColor: '#fca5a5', fontWeight: 700 }}
                >
                  <Trash2 size={16} /> Remove Listing
                </button>
              </div>
            ) : (
              <>
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  {isInCart ? 'Go to Cart' : 'Add to Cart'}
                </button>
                <button className="btn-buy-now" onClick={() => navigate('/borrow-request/' + item.id)}>
                  Borrow Now
                </button>
                
                <button className="btn-wishlist-detail" onClick={handleLike}>
                  {isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </>
            )}
            
            <div className="secure-tx">
              <ShieldCheck size={14} /> Secure transaction
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Item Modal (Owner Only) ── */}
      {showEditModal && (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="modal-card animate-in" style={{ background: '#fff', maxWidth: '480px', width: '100%', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div className="flex-row items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#111827' }}>Edit Item Settings</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>Item Title</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>Daily Price (₹)</label>
                <input 
                  type="text" 
                  value={editForm.price} 
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  placeholder="e.g. 150"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div className="flex-row gap-3 mt-4 pt-2" style={{ borderTop: '1px solid #f3f4f6', display: 'flex' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#000', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Remove Item Confirmation Modal (Owner Only) ── */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="modal-card animate-in" style={{ background: '#fff', maxWidth: '400px', width: '100%', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Remove Listing?</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to remove "<strong>{item.title}</strong>"? This action cannot be undone.
            </p>
            <div className="flex-row gap-3" style={{ display: 'flex' }}>
              <button 
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteItem}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
