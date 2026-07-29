import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Heart, Star, MapPin, Search } from 'lucide-react';
import './Wishlist.css';

export default function Wishlist() {
  const { user, toggleWishlist } = useUser();
  const navigate = useNavigate();
  const wishlistItems = user?.wishlist || [];
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div className="wishlist-header-inner">
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-subtitle">Items you've saved for later</p>
        </div>
      </div>

      <div className="wishlist-content">
        {wishlistItems.length > 0 ? (
          <div className="wishlist-grid">
            {wishlistItems.map(item => (
              <div key={item.id} className="rec-card card-clickable" onClick={() => navigate(`/item/${item.id}`)}>
                <div className="rec-img-wrap">
                  <img 
                    src={item.img || item.image || DEFAULT_IMAGE} 
                    alt={item.title} 
                    className="rec-img" 
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                  />
                  <div className="rec-category-badge">{item.category || 'General'}</div>
                  
                  <button
                    className="like-btn-home liked"
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                  >
                    <Heart size={16} fill="#ef4444" stroke="#ef4444" />
                  </button>
                </div>
                
                <div className="rec-info">
                  <div className="flex-row justify-between items-start mb-1">
                    <h4 className="rec-title">{item.title}</h4>
                    <div className="flex-row items-center gap-1">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.rating || 5.0}</span>
                    </div>
                  </div>
                  
                  <div className="flex-row items-center gap-1 mb-3">
                    <MapPin size={12} color="var(--text-light)" />
                    <span className="text-light" style={{ fontSize: '13px' }}>{item.distance || '0.5 km'} • By {item.owner || 'Neighbor'}</span>
                  </div>

                  <div className="mt-auto flex-row items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <p className="text-primary font-bold rec-price" style={{ fontSize: '16px' }}>{item.price}</p>
                    <span className="borrow-link text-primary font-bold" style={{ fontSize: '13px' }}>Borrow</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={48} className="text-light mb-4" />
            <h3>Your wishlist is empty</h3>
            <p className="text-gray mt-2 text-center max-w-md">
              You haven't saved any items yet. Browse the community resources and tap the heart icon to save items here.
            </p>
            <button className="btn btn-primary mt-6" onClick={() => navigate('/explore')}>
              Explore Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
