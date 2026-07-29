import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, User, ChevronLeft, ChevronRight, ShieldCheck, Send, Loader } from 'lucide-react';
import { useItems } from '../context/ItemContext';
import { useRequests } from '../context/RequestContext';
import { useNotifications } from '../context/NotificationContext';
import './BorrowRequest.css';

export default function BorrowRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useItems();
  const { addBorrowRequest } = useRequests();
  const { addNotification } = useNotifications();
  
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundItem = items.find(i => i.id === id || i.id === parseInt(id));
    if (foundItem) {
      setItem(foundItem);
      setMessage(`Hi ${foundItem.owner || 'Neighbor'}! I'd love to borrow your ${foundItem.title} for a couple of days. I'll take great care of it!`);
    }
  }, [id, items]);

  const handleConfirm = async () => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await addBorrowRequest({
        item_id: item.id,
        owner_id: item.user_id, // Assuming user_id exists on item
        message: message,
        duration: '2 days', // Simplified for now
        status: 'pending'
      });

      // Send notification to owner (if we had a real notification system for other users)
      // For now, just add a notification for the current user confirming the request
      addNotification({
        type: 'request_sent',
        icon: '📤',
        title: 'Request Sent',
        text: `Your request for ${item.title} has been sent to ${item.owner}.`,
        link: '/requests'
      });

      navigate('/requests');
    } catch (err) {
      console.error("Failed to send borrow request:", err);
    }
    setIsSubmitting(false);
  };

  if (!item) return <div className="p-10 text-center"><Loader className="spinning" /></div>;

  return (
    <div className="request-container">
      <div className="header-nav px-4 pt-4 pb-2" style={{ backgroundColor: 'var(--bg-color)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <X size={24} />
        </button>
        <h3 className="nav-title">Borrow Request</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="px-4 mt-2">
        <div className="item-snippet-card glass-card">
          <img src={item.img || item.image} alt={item.title} className="snippet-img" />
          <div className="snippet-info">
            <span className="section-label">ITEM DETAILS</span>
            <h4 className="snippet-title">{item.title}</h4>
            <div className="owner-row">
              <div className="snippet-avatar"><User size={12} color="var(--primary)" /></div>
              <span className="owner-text">Owned by {item.owner}</span>
            </div>
          </div>
        </div>

        <div className="flex-row items-center justify-between mt-8 mb-4">
          <h3 className="section-title">Select Duration</h3>
          <span className="selection-badge">2 days selected</span>
        </div>

        <div className="calendar-card">
          <div className="calendar-header">
            <button className="calendar-nav-btn"><ChevronLeft size={20} /></button>
            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>May 2026</h4>
            <button className="calendar-nav-btn"><ChevronRight size={20} /></button>
          </div>
          
          <div className="calendar-grid mt-4">
            <div className="calendar-day-name">S</div>
            <div className="calendar-day-name">M</div>
            <div className="calendar-day-name">T</div>
            <div className="calendar-day-name">W</div>
            <div className="calendar-day-name">T</div>
            <div className="calendar-day-name">F</div>
            <div className="calendar-day-name">S</div>

            <div className="calendar-day text-light"></div>
            <div className="calendar-day text-light"></div>
            <div className="calendar-day text-light"></div>
            <div className="calendar-day text-light"></div>
            <div className="calendar-day text-light">1</div>
            <div className="calendar-day text-light">2</div>
            <div className="calendar-day">3</div>

            <div className="calendar-day">4</div>
            <div className="calendar-day selected start">5</div>
            <div className="calendar-day selected end">6</div>
            <div className="calendar-day">7</div>
            <div className="calendar-day">8</div>
            <div className="calendar-day">9</div>
            <div className="calendar-day">10</div>

            <div className="calendar-day">11</div>
            <div className="calendar-day">12</div>
            <div className="calendar-day">13</div>
            <div className="calendar-day">14</div>
            <div className="calendar-day">15</div>
            <div className="calendar-day text-light"></div>
            <div className="calendar-day text-light"></div>
          </div>
        </div>

        <h3 className="section-title mt-8 mb-4">Personalized Message</h3>
        <div className="message-box">
          <textarea 
            className="message-textarea" 
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="message-footer">
            <span className="text-light" style={{ fontSize: '10px', fontWeight: '700' }}>MAX 250 CHARACTERS</span>
          </div>
        </div>

        <div className="guarantee-card mt-6">
          <div className="flex-row items-center gap-2 mb-2">
            <ShieldCheck size={16} color="var(--primary)" />
            <span className="text-primary font-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ResourceShare GUARANTEE</span>
          </div>
          <p className="text-gray" style={{ fontSize: '12px', lineHeight: '1.5' }}>
            By sending this request, you agree to the community guidelines and item handling terms. {item.owner} will be notified immediately.
          </p>
        </div>
      </div>

      <div className="bottom-action-bar-premium">
        <div className="action-stats-row">
          <div className="flex-col">
            <span className="stat-label">Estimated Contribution</span>
            <div className="flex-row items-baseline gap-2">
              <span className="price-tag">{item.price === 'Free' ? '₹0.00' : item.price}</span>
              <span className="price-subtext">({item.price === 'Free' ? 'Free Share' : 'Daily Rate'})</span>
            </div>
          </div>
          <div className="flex-col items-end">
            <span className="stat-label">Pickup</span>
            <span className="distance-badge">{item.distance} away</span>
          </div>
        </div>
        <button className="btn-confirm-request" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Confirm Borrow Request'} <Send size={20} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
