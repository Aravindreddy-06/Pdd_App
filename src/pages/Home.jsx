import { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Search, ArrowRight, Star, Clock, Heart, 
  Wrench, Monitor, Coffee, Tent, PartyPopper, Activity,
  Users, LayoutGrid, Navigation, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useItems } from '../context/ItemContext';
import './Home.css';

const CATEGORIES = [
  { id: 'Tools', icon: Wrench, color: '#3de81e', bg: '#eefeed' },
  { id: 'Electronics', icon: Monitor, color: '#06b6d4', bg: '#ecfeff' },
  { id: 'Kitchen', icon: Coffee, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'Outdoors', icon: Tent, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'Party', icon: PartyPopper, color: '#ec4899', bg: '#fdf2f8' }
];

// import { ALL_ITEMS } from '../data/items';

const LIVE_EVENTS = [
  { id: 1, text: "Sarah J. just shared a Pro Toolbox", time: "2 mins ago" },
  { id: 2, text: "Mike T. requested to borrow a Pressure Washer", time: "5 mins ago" },
  { id: 3, text: "Emma W. left a 5-star review for Stand Mixer", time: "12 mins ago" },
  { id: 4, text: "Alex R. returned the Sony Headphones", time: "28 mins ago" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, loading, requestLocation, toggleWishlist } = useUser();
  const { items } = useItems();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [dynamicItems, setDynamicItems] = useState([]);

  // Simulated live event ticker
  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);


  const mergedItems = useMemo(() => {
    // Add dummy locations to items for the map preview if they don't have them
    return items.map((item, index) => {
      if (item.location) return item;
      const latOffset = (Math.sin(index * 1.5) * 0.015); 
      const lngOffset = (Math.cos(index * 1.5) * 0.015);
      const baseCenter = user?.coordinates || { lat: 12.9716, lng: 77.5946 };
      return {
        ...item,
        distance: `${(Math.random() * 2 + 0.1).toFixed(1)} km`,
        location: { lat: baseCenter.lat + latOffset, lng: baseCenter.lng + lngOffset }
      };
    });
  }, [items, user?.coordinates]);

  const toggleLike = (e, item) => {
    e.stopPropagation();
    toggleWishlist(item);
  };

  const filteredItems = mergedItems.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory ? item.category?.toLowerCase() === activeCategory.toLowerCase() : true;
    return matchesSearch && matchesCat;
  });

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="home-page">
      {/* ── Sub-Header: Category Strip (Flipkart Style) ── */}
      <div className="home-category-strip">
        <div className="strip-inner">
          <div className="category-item active" onClick={() => setActiveCategory(null)}>
            <LayoutGrid size={20} />
            <span>All</span>
          </div>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <div 
                key={cat.id} 
                className={`category-item ${isActive ? 'active' : ''}`} 
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon size={20} />
                <span>{cat.id}</span>
              </div>
            );
          })}
          <div className="category-item" onClick={() => navigate('/requests')}>
            <Activity size={20} />
            <span>Requests</span>
          </div>
          <div className="category-item" onClick={() => navigate('/circles')}>
            <Users size={20} />
            <span>Circles</span>
          </div>
        </div>
      </div>

      {/* ── Promotional Banners (Amazon Style) ── */}
      <section className="home-banners">
        <div className="banner-item main-banner">
          <div className="banner-content">
            <h2>Borrow What You Need</h2>
            <p>Save money and space. Connect with neighbors today.</p>
            <button className="banner-btn" onClick={() => navigate('/explore')}>Explore Now</button>
          </div>
          <img src="https://images.unsplash.com/photo-1581785056127-4829c5bede5d?auto=format&fit=crop&w=1200&q=80" alt="Banner" className="banner-img" />
        </div>
      </section>

      {/* ── Main Dashboard Grids ────────────────────────── */}
      <div className="home-content">
        
        {/* Pinned Location Display */}
        <div className="home-location-bar" onClick={() => navigate('/location-access')} style={{ cursor: 'pointer' }}>
          <div className="flex-row items-center gap-2">
            <MapPin size={16} color="var(--primary)" />
            <span className="location-text">
              {loading ? (
                <span className="animate-pulse">Detecting your location...</span>
              ) : (
                <>Showing items near <strong>{user?.location || 'Detecting...'}</strong></>
              )}
            </span>
          </div>
          <ChevronRight size={16} color="var(--text-gray)" />
        </div>



        {/* Row 1: Deals / Top Picks */}
        <section className="home-section">
          <div className="section-header-row">
            <h3>Rental Deals of the Day</h3>
            <button className="view-all-link">View all</button>
          </div>
          <div className="horizontal-scroll-grid">
            {mergedItems.slice(0, 6).map(item => (
              <div key={item.id} className="deal-card" onClick={() => navigate(`/item/${item.id}`)}>
                <img src={item.img || item.image || DEFAULT_IMAGE} alt={item.title} />
                <div className="deal-info">
                  <span className="deal-badge">Up to 40% Off</span>
                  <p className="deal-title">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Row 2: Suggested for You (Main Grid) */}
        <section id="inventory" className="home-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : activeCategory 
                    ? `${activeCategory} near you`
                    : 'Recommended in your neighborhood'
                }
              </h2>
              {(!searchQuery && !activeCategory) && (
                <p className="text-gray mt-1" style={{ fontSize: '15px' }}>Based on local trends and what your neighbors are borrowing.</p>
              )}
            </div>
            {filteredItems.length > 5 && (
              <button className="btn btn-outline" onClick={() => navigate('/explore')} style={{ borderRadius: '24px' }}>
                View Map <ArrowRight size={16} />
              </button>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <div className="rec-grid">
              {filteredItems.map(item => (
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
                      className={`like-btn-home ${user?.wishlist?.some(w => w.id === item.id) ? 'liked' : ''}`}
                      onClick={(e) => toggleLike(e, item)}
                    >
                      <Heart size={16} fill={user?.wishlist?.some(w => w.id === item.id) ? '#ef4444' : 'none'} stroke={user?.wishlist?.some(w => w.id === item.id) ? '#ef4444' : '#fff'} />
                    </button>
                  </div>
                  
                  <div className="rec-info">
                    <div className="flex-row justify-between items-start mb-1">
                      <h4 className="rec-title">{item.title}</h4>
                      <div className="flex-row items-center gap-1">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex-row items-center gap-1 mb-3">
                      <MapPin size={12} color="var(--text-light)" />
                      <span className="text-light" style={{ fontSize: '13px' }}>{item.distance} • By {item.owner}</span>
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
              <Search size={40} className="text-light mb-3" />
              <h3>No items found</h3>
              <p className="text-gray mt-2 text-center max-w-md">
                We couldn't find anything matching "{searchQuery}" in {activeCategory || 'any category'}. 
                Try adjusting your search or expanding your location radius.
              </p>
              <button className="btn btn-outline mt-4" onClick={() => { setSearchQuery(''); setActiveCategory(null); }}>
                Clear Filters
              </button>
            </div>
          )}
        </section>
        {/* ── Community Impact CTA ─────────────────────────── */}
        <section className="home-section mb-24">
          <div className="flex-row justify-between items-center">
            <div>
              <h2 className="section-title">Your Community Impact</h2>
              <p className="text-gray mt-1">See how you're helping your neighborhood and tracking your activity.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/impact')} style={{ borderRadius: '24px' }}>
              View Full Report <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

