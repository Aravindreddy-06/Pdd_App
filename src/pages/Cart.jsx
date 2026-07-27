import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trash2, ShoppingCart, Minus, Plus, 
  ShieldCheck, Clock, MapPin, ChevronRight, Bookmark
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../context/NotificationContext';
import PaymentModal from '../components/PaymentModal';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { user, removeFromCart, updateCartItem, toggleWishlist } = useUser();
  const { addNotification } = useNotifications();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const items = user?.cart || [];
  const savedItems = user?.wishlist || [];

  // Calculations
  const subtotal = useMemo(() => items.reduce((acc, item) => {
    const priceValue = typeof item.price === 'string' 
      ? parseInt(item.price.replace(/[^0-9]/g, '')) || 0 
      : item.price || 0;
    return acc + (priceValue * (item.days || 1));
  }, 0), [items]);
  
  const platformFee = items.length > 0 ? 15 : 0;
  const total = subtotal + platformFee;

  // Handlers
  const updateDays = (id, delta) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newDays = Math.max(1, (item.days || 1) + delta);
      updateCartItem(id, { days: newDays });
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const saveForLater = (item) => {
    removeFromCart(item.id);
    toggleWishlist(item);
  };

  const moveToCart = (item) => {
    toggleWishlist(item);
    // UserContext's addToCart handles duplicates
    // But since it was in wishlist, we move it back to cart
  };

  return (
    <div className="cart-container">
      <div className="header-nav px-4 pt-4 pb-2" style={{ backgroundColor: 'var(--bg-white)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">Shopping Cart</h3>
        <button className="back-btn" onClick={() => items.forEach(i => removeFromCart(i.id))} title="Clear Cart">
          <Trash2 size={20} color="var(--text-gray)" />
        </button>
      </div>

      <div className="cart-content-wrapper px-4 mt-6">
        <div className="cart-layout">
          
          {/* ── Left Column: Items ────────────────────────── */}
          <div className="cart-items-section">
            {items.length === 0 ? (
              <div className="empty-cart-realistic">
                <div className="empty-illustration">
                  <ShoppingCart size={80} color="#cbd5e1" strokeWidth={1} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>Your cart is empty</h2>
                <p style={{ color: 'var(--text-gray)', marginTop: '8px', maxWidth: '300px' }}>
                  Looks like you haven't added any items to your rental cart yet.
                </p>
                <button 
                  className="btn btn-primary mt-8" 
                  style={{ padding: '12px 40px' }}
                  onClick={() => navigate('/explore')}
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <>
                <div className="section-label flex-row items-center justify-between">
                  <span>Items for Rental ({items.length})</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-gray)', fontWeight: 500 }}>Price</span>
                </div>
                
                {items.map((item) => {
                  const priceValue = typeof item.price === 'string' 
                    ? parseInt(item.price.replace(/[^0-9]/g, '')) || 0 
                    : item.price || 0;
                  
                  return (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-img-container">
                        <img src={item.img || item.image} alt={item.title} className="cart-item-img" />
                      </div>
                      
                      <div className="cart-item-details">
                        <div className="cart-item-main">
                          <div>
                            <h4 className="cart-item-title">{item.title}</h4>
                            <p className="cart-item-owner">Owner: <strong>{item.owner}</strong></p>
                            <div className="flex-row items-center gap-2 mt-2">
                               <button className="btn-move-cart" onClick={() => saveForLater(item)}>
                                 Save for Later
                               </button>
                            </div>
                          </div>
                          <button className="item-remove-btn" onClick={() => handleRemove(item.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="cart-item-footer">
                          <div className="quantity-picker">
                            <button 
                              className="qty-control" 
                              onClick={() => updateDays(item.id, -1)}
                              disabled={(item.days || 1) <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <div className="qty-display">{item.days || 1} {(item.days || 1) === 1 ? 'day' : 'days'}</div>
                            <button 
                              className="qty-control" 
                              onClick={() => updateDays(item.id, 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="cart-item-price">₹{priceValue * (item.days || 1)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ── Save for Later Section ──────────────────── */}
            {savedItems.length > 0 && (
              <div className="save-later-section">
                <h3 className="section-label">Saved for Later ({savedItems.length})</h3>
                <div className="flex-col gap-4">
                  {savedItems.map(item => (
                    <div key={item.id} className="cart-item-card save-item-card">
                      <div className="cart-item-img-container">
                        <img src={item.img || item.image} alt={item.title} className="cart-item-img" />
                      </div>
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">{item.title}</h4>
                        <p className="cart-item-owner">By {item.owner}</p>
                        <div className="flex-row gap-3 mt-3">
                          <button className="btn btn-primary btn-sm" onClick={() => moveToCart(item)}>
                            Move to Cart
                          </button>
                          <button className="btn btn-light btn-sm" onClick={() => toggleWishlist(item)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Order Summary ──────────────── */}
          {items.length > 0 && (
            <div className="order-summary-section">
              <div className="order-summary-card">
                <h3 className="summary-title">Order Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal}.00</span>
                </div>
                
                <div className="summary-row">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}.00</span>
                </div>
                
                <div className="summary-row" style={{ color: '#22c55e', fontWeight: 600 }}>
                  <span>Neighborhood Discount</span>
                  <span>-₹0.00</span>
                </div>

                <div className="promo-section">
                  <div className="promo-input-wrap">
                    <input type="text" placeholder="Promo code" className="promo-input" />
                    <button className="btn-apply">Apply</button>
                  </div>
                </div>

                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{total}.00</span>
                </div>

                <button 
                  className="btn btn-primary w-full mt-6" 
                  style={{ padding: '16px', fontSize: '16px' }}
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  Proceed to Payment
                </button>

                <div className="trust-badges">
                  <div className="badge-item">
                    <ShieldCheck size={16} color="#22c55e" />
                    <span>ResourceShare Trust Protection included</span>
                  </div>
                  <div className="badge-item">
                    <MapPin size={16} color="#64748b" />
                    <span>Free local pickup available for all items</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Checkout Bar ─────────────────────────── */}
      {items.length > 0 && (
        <div className="cart-mobile-footer">
          <div className="flex-col">
            <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Total Payable</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-dark)' }}>₹{total}.00</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 32px' }}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Checkout
          </button>
        </div>
      )}

      {/* ── Payment Modal Integration ─────────────────────── */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={total}
        items={items}
        onSuccess={(paymentInfo) => {
          items.forEach(i => removeFromCart(i.id));
          if (addNotification) {
            addNotification({
              type: 'payment_success',
              icon: '💳',
              title: 'Payment Successful!',
              text: `Your payment of ₹${total}.00 was processed. Request sent to owner.`,
              link: '/requests'
            });
          }
          setIsPaymentModalOpen(false);
          navigate('/requests');
        }}
      />
    </div>
  );
}
