import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ShieldCheck, Lock, Plus, Search, ChevronRight, Compass } from 'lucide-react';
import Logo from '../components/Logo';
import './Circles.css';

export default function Circles() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircleData, setNewCircleData] = useState({ name: '', type: 'Apartment', description: '' });

  const [myCircles, setMyCircles] = useState([]);
  const [isExploring, setIsExploring] = useState(false);
  const [discoveredCircles, setDiscoveredCircles] = useState([]);

  const nearbyMockCircles = [
    {
      id: 101,
      name: 'Downtown Artisans',
      members: 54,
      items: 120,
      type: 'Creative Group',
      verified: true,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 102,
      name: 'Oakwood Neighborhood',
      members: 210,
      items: 340,
      type: 'Neighborhood',
      verified: true,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 103,
      name: 'Tech Enthusiasts Club',
      members: 89,
      items: 45,
      type: 'Interest Group',
      verified: false,
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=100&q=80'
    }
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newCircleData.name.trim()) return;

    const newCircle = {
      id: Date.now(),
      name: newCircleData.name,
      members: 1,
      items: 0,
      type: newCircleData.type,
      verified: false,
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=100&q=80'
    };

    setMyCircles([newCircle, ...myCircles]);
    setShowCreateModal(false);
    setNewCircleData({ name: '', type: 'Apartment', description: '' });
  };

  const handleExploreNearby = () => {
    setIsExploring(true);
    // Simulate a network request to find nearby circles
    setTimeout(() => {
      // Filter out circles we've already joined
      const joinedIds = myCircles.map(c => c.id);
      const available = nearbyMockCircles.filter(c => !joinedIds.includes(c.id));
      setDiscoveredCircles(available);
      setIsExploring(false);
    }, 1200);
  };

  const handleJoinCircle = (circleToJoin) => {
    setMyCircles([...myCircles, circleToJoin]);
    setDiscoveredCircles(discoveredCircles.filter(c => c.id !== circleToJoin.id));
  };

  return (
    <div className="circles-page">
      <header className="circles-header">
        <div className="circles-header-content">
          <button className="back-btn-round" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="title-section">
            <div className="title-row">
              <Logo size={42} />
              <h1>Trust Circles</h1>
            </div>
            <p>Share securely with verified groups, neighbors, and communities you know and trust.</p>
          </div>
          <button className="btn-create-circle" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Create Circle
          </button>
        </div>
      </header>

      <main className="circles-content">
        <section className="circles-section">
          <div className="section-header">
            <h2>My Circles</h2>
            <span>{myCircles.length} Joined</span>
          </div>

          {myCircles.length === 0 ? (
            <div className="empty-circles-discovery" style={{ padding: '40px 24px', marginBottom: '24px' }}>
              <Users size={48} className="empty-icon" style={{ opacity: 0.5 }} />
              <p>You haven't joined any circles yet. Create one or discover nearby circles below!</p>
            </div>
          ) : (
            <div className="circles-list">
              {myCircles.map(circle => (
                <div key={circle.id} className="circle-card-premium">
                  <img src={circle.image} alt={circle.name} className="circle-img" />
                  <div className="circle-info">
                    <div className="circle-name-row">
                      <h3>{circle.name}</h3>
                      {circle.verified && <ShieldCheck size={18} className="verified-icon" />}
                    </div>
                    <p className="circle-meta">{circle.type} • {circle.members} Members</p>
                    <div className="circle-stats">
                      <span className="items-count">{circle.items} items available</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="arrow-icon" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="circles-section mt-12">
          <div className="section-header">
            <h2>Discover Circles</h2>
            <button className="text-btn">View All</button>
          </div>

          <div className="search-box-circles">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Find nearby apartments, clubs, or societies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {discoveredCircles.length > 0 ? (
            <div className="circles-list">
              {discoveredCircles.map(circle => (
                <div key={circle.id} className="circle-card-premium">
                  <img src={circle.image} alt={circle.name} className="circle-img" />
                  <div className="circle-info">
                    <div className="circle-name-row">
                      <h3>{circle.name}</h3>
                      {circle.verified && <ShieldCheck size={18} className="verified-icon" />}
                    </div>
                    <p className="circle-meta">{circle.type} • {circle.members} Members</p>
                    <div className="circle-stats">
                      <span className="items-count">{circle.items} items</span>
                    </div>
                  </div>
                  <button className="btn-discover" onClick={() => handleJoinCircle(circle)} style={{ padding: '8px 16px' }}>
                    Join
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-circles-discovery">
              <Compass size={56} className={`empty-icon ${isExploring ? 'spin' : 'bob'}`} />
              <p>{isExploring ? 'Searching for verified groups nearby...' : 'Enter your building name or locality to find existing Trust Circles near you.'}</p>
              {!isExploring && (
                <button className="btn-discover" onClick={handleExploreNearby}>Explore Nearby</button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="circle-modal-overlay fadeIn">
          <div className="circle-modal-content scaleUp">
            <div className="circle-modal-header">
              <h2>Create a Trust Circle</h2>
              <p>Form a verified group for your neighborhood or club.</p>
            </div>
            <form onSubmit={handleCreateSubmit} className="circle-modal-form">
              <div className="form-group">
                <label>Circle Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sunset Apartments" 
                  value={newCircleData.name}
                  onChange={e => setNewCircleData({...newCircleData, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={newCircleData.type}
                  onChange={e => setNewCircleData({...newCircleData, type: e.target.value})}
                >
                  <option value="Apartment">Apartment/Condo</option>
                  <option value="Neighborhood">Neighborhood</option>
                  <option value="Interest Group">Interest Group</option>
                  <option value="School">School/University</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  placeholder="What is this circle about?"
                  value={newCircleData.description}
                  onChange={e => setNewCircleData({...newCircleData, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="circle-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-create-submit" disabled={!newCircleData.name.trim()}>
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
