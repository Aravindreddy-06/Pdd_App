import { useState, useMemo, useEffect } from 'react';
import {
  MapPin, Search, Star, Heart,
  Wrench, Monitor, Coffee, Tent, PartyPopper,
  Map, LayoutGrid, ChevronRight, SlidersHorizontal, CheckCircle2, Sparkles, Navigation
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import { useUser } from '../hooks/useUser';
import { useItems } from '../context/ItemContext';
import './Explore.css';

const CATEGORIES = [
  { label: 'All Items',   icon: Sparkles,     key: null,          color: '#84cc16', bg: 'rgba(132, 204, 22, 0.1)', gradient: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
  { label: 'Tools',       icon: Wrench,       key: 'Tools',       color: '#a3e635', bg: 'rgba(163, 230, 53, 0.1)', gradient: 'linear-gradient(135deg, #a3e635, #65a30d)' },
  { label: 'Electronics', icon: Monitor,      key: 'Electronics', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)' },
  { label: 'Kitchen',     icon: Coffee,       key: 'Kitchen',     color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { label: 'Outdoors',    icon: Tent,         key: 'Outdoors',    color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
  { label: 'Party',       icon: PartyPopper,  key: 'Party',       color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' }
];

// import { ALL_ITEMS as STATIC_ITEMS } from '../data/items';

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, requestLocation, toggleWishlist } = useUser();
  const { items: allItems } = useItems();
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [dynamicItems, setDynamicItems] = useState([]);
  const [sortBy, setSortBy] = useState('distance'); // distance, price, rating
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);
  
  const mapCenter = useMemo(() => user?.coordinates || { lat: 47.6062, lng: -122.3321 }, [user?.coordinates]);
  const locationName = user?.location || "Downtown Seattle";


  // const allItems = useMemo(() => STATIC_ITEMS, []);
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80';

  const toggleLike = (e, item) => {
    e.stopPropagation();
    toggleWishlist(item);
  };

  const filteredAndSorted = useMemo(() => {
    let result = allItems.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory ? item.category === activeCategory : true;
      return matchesSearch && matchesCat;
    });

    // Dummy coordinate assignment for DB items without locations
    result = result.map((item, index) => {
      if(item.location) return item;
      const latOffset = (Math.sin(index * 1.5) * 0.03); 
      const lngOffset = (Math.cos(index * 1.5) * 0.03);
      return {
        ...item,
        distance: (Math.random() * 2 + 0.1).toFixed(1),
        rating: (Math.random() * 1 + 4).toFixed(1),
        owner: item.owner || 'Local Neighbor',
        location: { lat: mapCenter.lat + latOffset, lng: mapCenter.lng + lngOffset }
      };
    });

    // Sorting
    if (sortBy === 'distance') {
      result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'price') {
      // Very basic price parse
      const getPrice = (str) => {
        if(str === 'Free') return 0;
        const match = str.match(/\d+/);
        return match ? parseInt(match[0]) : 999;
      };
      result.sort((a, b) => getPrice(a.price) - getPrice(b.price));
    }

    return result;
  }, [allItems, activeCategory, searchQuery, sortBy, mapCenter]);

  return (
    <div className="explore-page">
      
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="explore-header-bg">
        <div className="explore-header-inner">
          <div>
            <h1 className="explore-title">Explore Resources</h1>
            <div className="location-selector" onClick={() => navigate('/location-access')}>
              <MapPin size={18} className="text-primary" />
              <span>
                {loading ? "Detecting..." : locationName}
              </span>
              <div className="flex-row items-center gap-1">
                <button 
                  className="refresh-location-btn p-1 rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    requestLocation('auto');
                  }}
                >
                  <Navigation size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
          <form className="explore-search" onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              setSearchParams({ q: searchQuery.trim() });
            } else {
              setSearchParams({});
            }
            document.getElementById('explore-main')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for items, categories..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchParams(e.target.value.trim() ? { q: e.target.value.trim() } : {});
              }}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ── Category Strip ───────────────────────────────── */}
      <div className="category-strip-wrapper">
        <div className="category-strip">
          {CATEGORIES.map(({ label, icon: Icon, key, color, bg, gradient }) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={label}
                className={`cat-chip ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(isActive && key !== null ? null : key)}
              >
                <span
                  className="cat-chip-icon"
                  style={isActive
                    ? { background: gradient, boxShadow: `0 8px 20px ${color}55` }
                    : { background: bg }
                  }
                >
                  <Icon size={22} color={isActive ? '#fff' : color} strokeWidth={2} />
                </span>
                <span className={`cat-chip-label ${isActive ? 'active' : ''}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="explore-layout">
        
        {/* Sidebar Filters */}
        <aside className="explore-sidebar">

          <div className="filter-block">
            <h3 className="filter-title">Sort By</h3>
            <select 
              className="explore-select" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Distance (Nearest)</option>
              <option value="rating">Rating (Highest)</option>
              <option value="price">Price (Lowest)</option>
            </select>
          </div>

          <div className="filter-block">
            <h3 className="filter-title flex-row items-center justify-between">
              Availability
            </h3>
            <label className="toggle-label mt-2">
              <input 
                type="checkbox" 
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-switch"></span>
              <span style={{ fontSize: '15px', color: 'var(--text-dark)' }}>Available Now</span>
            </label>
          </div>

          {/* Map quick view block */}
          <div className="map-quick-view" onClick={() => setViewMode('map')}>
            <div className="map-quick-overlay">
              <Map size={24} />
              <span>View Interactive Map</span>
            </div>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="explore-main" id="explore-main">
          
          <div className="results-header">
            <div className="results-count">
              <strong>{filteredAndSorted.length}</strong> items found
              {searchQuery && <span> for "{searchQuery}"</span>}
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <LayoutGrid size={16} /> Grid
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <Map size={16} /> Map
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="explore-map-wrap">
              <MapComponent 
                items={filteredAndSorted} 
                center={mapCenter}
                userLocation={mapCenter}
                height="100%"
              />
            </div>
          ) : filteredAndSorted.length > 0 ? (
            <div className="explore-grid">
              {filteredAndSorted.map((item, index) => (
                <div key={item.id || index} className="rec-card card-clickable" onClick={() => navigate(`/item/${item.id}`)}>
                  <div className="rec-img-wrap">
                    <img 
                      src={item.img || item.image || DEFAULT_IMAGE} 
                      alt={item.title} 
                      className="rec-img" 
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                    />
                    <div className="rec-category-badge">{item.category || 'General'}</div>
                    
                    <button
                      className={`like-btn-explore ${user?.wishlist?.some(w => w.id === item.id) ? 'liked' : ''}`}
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
                      <span className="text-light" style={{ fontSize: '13px' }}>{item.distance} km • By {item.owner}</span>
                    </div>

                    <div className="mt-auto flex-row items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-primary font-bold rec-price" style={{ fontSize: '16px' }}>{item.price}</p>
                      <div className="flex-row items-center gap-1">
                        <CheckCircle2 size={14} color="#22c55e" />
                        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={48} className="text-light mb-4" />
              <h3>No matching resources</h3>
              <p className="text-gray mt-2 text-center max-w-md">
                We couldn't find any resources matching your filters. Try clearing your search or selecting a different category.
              </p>
              <button className="btn btn-outline mt-6" onClick={() => { setSearchQuery(''); setActiveCategory(null); }}>
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
