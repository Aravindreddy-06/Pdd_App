import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, MessageSquare, MapPin, Clock, 
  Search, Filter, X, Send, Sparkles, Loader
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useRequests } from '../context/RequestContext';
import './Requests.css';

export default function Requests() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { communityRequests, borrowRequests, loading, addCommunityRequest, updateBorrowRequestStatus } = useRequests();
  
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'incoming'
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newRequest, setNewRequest] = useState({
    item: '',
    description: '',
    urgency: 'Normal'
  });
  const [posting, setPosting] = useState(false);

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.item || !newRequest.description) return;
    
    setPosting(true);
    try {
      await addCommunityRequest({
        ...newRequest,
        location: user?.location || 'Local Area',
      });
      setShowPostModal(false);
      setNewRequest({ item: '', description: '', urgency: 'Normal' });
    } catch (err) {
      console.error("Failed to post request:", err);
    }
    setPosting(false);
  };

  const handleResponse = async (id, status) => {
    try {
      await updateBorrowRequestStatus(id, status);
    } catch (err) {
      console.error("Failed to update request status:", err);
    }
  };

  const filteredRequests = activeTab === 'incoming' 
    ? borrowRequests 
    : communityRequests.filter(req => {
        const matchesSearch = req.item?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              req.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === 'my') return req.user_id === user?.id && matchesSearch;
        return matchesSearch;
      });

  return (
    <div className="requests-page">
      <header className="requests-header">
        <div className="header-top">
          <button className="back-btn-round" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1>Community Board</h1>
          <button className="btn-create-request" onClick={() => setShowPostModal(true)}>
            <Plus size={18} /> Post Need
          </button>
        </div>
        <p className="header-subtitle">Can't find what you need? Ask your neighborhood community!</p>
        
        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search for tools, help, or items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-btn">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <main className="requests-content">
        <div className="tabs-strip">
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>Community Board</button>
          <button className={activeTab === 'incoming' ? 'active' : ''} onClick={() => setActiveTab('incoming')}>
            Incoming Requests {borrowRequests.filter(r => r.status === 'pending').length > 0 && <span className="tab-badge">!</span>}
          </button>
          <button className={activeTab === 'my' ? 'active' : ''} onClick={() => setActiveTab('my')}>My Posts</button>
        </div>

        {loading ? (
          <div className="requests-loading">
            <Loader className="spinning" />
            <p>Loading community posts...</p>
          </div>
        ) : (
          <div className="requests-list">
            {activeTab === 'incoming' ? (
              filteredRequests.map(req => (
                <div key={req.id} className={`request-card-premium incoming-card ${req.status}`}>
                  <div className="request-user-info">
                    <img src={req.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.profiles?.full_name || 'Neighbor')}&background=84cc16&color=fff`} alt={req.profiles?.full_name} className="user-avatar-sm" />
                    <div className="user-meta">
                      <span className="user-name">{req.profiles?.full_name || 'Neighbor'} <span className="wants-label">wants to borrow</span></span>
                      <span className="post-time">{req.duration}</span>
                    </div>
                    <div className={`status-pill ${req.status}`}>{req.status}</div>
                  </div>
                  <div className="request-body">
                    <h3 className="request-item-name">{req.items?.title || 'Unknown Item'}</h3>
                    <p className="request-desc">"{req.message}"</p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="request-actions-row">
                      <button className="btn-decline" onClick={() => handleResponse(req.id, 'declined')}>Decline</button>
                      <button className="btn-accept" onClick={() => handleResponse(req.id, 'accepted')}>Accept Request</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              filteredRequests.map(req => (
                <div key={req.id} className="request-card-premium animate-in">
                  <div className="request-user-info">
                    <div className="avatar-ring">
                      <img src={req.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.profiles?.full_name || 'Neighbor')}&background=84cc16&color=fff`} alt={req.profiles?.full_name} className="user-avatar-sm" />
                    </div>
                    <div className="user-meta">
                      <span className="user-name">
                        {req.profiles?.full_name || 'Neighbor'} 
                        {req.user_id === user?.id && <span className="you-badge">YOU</span>}
                      </span>
                      <span className="post-time">
                        <Clock size={12} /> {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    {req.urgency === 'High' ? (
                      <span className="urgency-badge urgent">
                        <Sparkles size={10} /> Urgent
                      </span>
                    ) : (
                      <span className="urgency-badge normal">Seeking Help</span>
                    )}
                  </div>
                  
                  <div className="request-body">
                    <div className="request-header-row">
                      <h3 className="request-item-name">{req.item}</h3>
                      <div className="category-tag">Community Request</div>
                    </div>
                    <p className="request-desc">{req.description}</p>
                  </div>

                  <div className="request-footer">
                    <div className="request-stats">
                      <div className="stat-item">
                        <MapPin size={14} color="var(--primary)" /> 
                        <span className="stat-text">{req.location}</span>
                      </div>
                    </div>
                    <div className="flex-row items-center gap-3">
                      <span className="responses-count">{req.responses || 0} neighbors replied</span>
                      <button 
                        className={`btn-help-neighbor ${req.user_id === user?.id ? 'disabled' : ''}`}
                        onClick={() => req.user_id !== user?.id && navigate(`/chat/${req.id}`)}
                        disabled={req.user_id === user?.id}
                      >
                        <MessageSquare size={16} /> 
                        {req.user_id === user?.id ? 'Manage Post' : 'Lend a Hand'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {filteredRequests.length === 0 && (
              <div className="empty-requests">
                <Sparkles size={40} color="var(--primary)" />
                <h3>No requests found</h3>
                <p>Be the first to ask for something or try a different search!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Post Request Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="post-request-modal animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post a New Request</h2>
              <button className="close-btn" onClick={() => setShowPostModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handlePostRequest} className="post-form">
              <div className="form-group">
                <label>What do you need?</label>
                <input 
                  type="text" 
                  placeholder="e.g. Power Drill, Ladder, Party Lights..." 
                  value={newRequest.item}
                  onChange={e => setNewRequest({...newRequest, item: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tell your neighbors more</label>
                <textarea 
                  placeholder="Explain why you need it and for how long. Being specific helps!"
                  value={newRequest.description}
                  onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <div className="urgency-selector">
                  {['Normal', 'High'].map(level => (
                    <button 
                      key={level}
                      type="button"
                      className={newRequest.urgency === level ? 'active' : ''}
                      onClick={() => setNewRequest({...newRequest, urgency: level})}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-submit-request" disabled={posting}>
                {posting ? <Loader className="spinning" size={18} /> : <><Send size={18} /> Post to Neighborhood</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

