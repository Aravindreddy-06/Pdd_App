import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MapPin, Star, ShieldCheck, Truck, ChevronRight, Loader } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useItems } from '../context/ItemContext';
import './ItemDetails.css';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWishlist, addToCart } = useUser();
  const { items, loading } = useItems();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const item = items.find(i => i.id === id || i.id === parseInt(id));
  
  if (loading) return <div className="p-10 text-center"><Loader className="spinning" /></div>;
  if (!item) return <div className="p-10 text-center"><h3>Item not found</h3><button className="btn btn-primary mt-4" onClick={() => navigate('/home')}>Back to Home</button></div>;

  const isLiked = user?.wishlist?.some(w => w.id === item.id);
  const isInCart = user?.cart?.some(c => c.id === item.id);

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
                <h4>{item.owner}</h4>
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

            <button className="btn-add-cart" onClick={handleAddToCart}>
              {isInCart ? 'Go to Cart' : 'Add to Cart'}
            </button>
            <button className="btn-buy-now" onClick={() => navigate('/borrow-request/' + item.id)}>
              Borrow Now
            </button>
            
            <button className="btn-wishlist-detail" onClick={handleLike}>
              {isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            
            <div className="secure-tx">
              <ShieldCheck size={14} /> Secure transaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
