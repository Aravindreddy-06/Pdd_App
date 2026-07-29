import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Plus, Send } from 'lucide-react';
import './Chat.css';

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div className="chat-container">
      <div className="header-nav px-4 pt-4 pb-4 bg-white" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="flex-col items-center">
          <h3 className="nav-title" style={{ fontSize: '18px' }}>Alex Rivera</h3>
          <span className="text-primary font-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>ONLINE</span>
        </div>
        <button className="back-btn">
          <Phone size={22} color="var(--text-dark)" />
        </button>
      </div>

      <div className="chat-item-banner">
        <img src="https://images.unsplash.com/photo-1592424001806-0dbfa77e387c?auto=format&fit=crop&w=100&q=80" alt="Item" className="chat-item-img" />
        <div className="chat-item-info">
          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>EGO Power+ Self-Propel...</h4>
          <span className="text-gray" style={{ fontSize: '12px' }}>Active Request • Oct 12–14</span>
        </div>
        <button className="btn-details">Details</button>
      </div>

      <div className="chat-area px-4">
        <div className="chat-divider">
          <span className="chat-divider-text">TODAY</span>
        </div>

        {/* Receiver Message */}
        <div className="message-wrapper receiver">
          <div className="message-header">
            <span className="message-name">Alex</span>
            <span className="message-time">09:12 AM</span>
          </div>
          <div className="message-content-row">
            <img src="https://ui-avatars.com/api/?name=Alex&background=random&color=fff" alt="Alex" className="chat-avatar" />
            <div className="bubble bubble-receiver">
              Hi! The lawn mower is available. When would you like to pick it up?
            </div>
          </div>
        </div>

        {/* Sender Message */}
        <div className="message-wrapper sender mt-4">
          <div className="message-header" style={{ justifyContent: 'flex-end' }}>
            <span className="message-time">09:15 AM</span>
            <span className="message-name ml-2">You</span>
          </div>
          <div className="message-content-row" style={{ flexDirection: 'row-reverse' }}>
            <img src="https://ui-avatars.com/api/?name=You&background=84cc16&color=fff" alt="You" className="chat-avatar" />
            <div className="bubble bubble-sender">
              Great! Is tomorrow morning at 10 AM okay? I'll be coming with a truck.
            </div>
          </div>
        </div>

        {/* Receiver Message with map */}
        <div className="message-wrapper receiver mt-4">
          <div className="message-header">
            <span className="message-name">Alex</span>
            <span className="message-time">09:17 AM</span>
          </div>
          <div className="message-content-row" style={{ alignItems: 'flex-start' }}>
            <div style={{ width: '32px' }}></div> {/* Empty space since avatar was shown before, though design shows no avatar here */}
            <div className="flex-col gap-2">
              <div className="bubble bubble-receiver">
                That works for me. Here is the location for pickup. I'll leave the battery charging for you!
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/OpenStreetMap_Mapnik_zoom_level_13.png" alt="Map Location" className="chat-map-img" />
            </div>
          </div>
        </div>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-container">
          <button className="chat-plus-btn">
            <Plus size={20} color="white" />
          </button>
          <input type="text" className="chat-input-field" placeholder="Message Alex..." />
          <button className="chat-send-btn">
            <Send size={20} color="var(--text-dark)" />
          </button>
        </div>
        
        <div className="quick-replies">
          <button className="quick-reply-btn">See you then!</button>
          <button className="quick-reply-btn">Thanks a lot</button>
          <button className="quick-reply-btn">Can I extend?</button>
        </div>
      </div>
    </div>
  );
}
