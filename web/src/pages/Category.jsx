import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Map, SlidersHorizontal, ChevronDown, MapPin, Heart } from 'lucide-react';
import { useItems } from '../context/ItemContext';
import './Category.css';

export default function Category() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: allItems } = useItems();
  
  // Use category from state or default to TOOLS
  const activeCategory = location.state?.category || 'TOOLS';

  const items = allItems.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="category-container">
      <div className="header-nav px-4 pt-4">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title" style={{ textTransform: 'capitalize' }}>{activeCategory.toLowerCase()}</h3>
        <div className="header-actions">
          <Search size={22} className="text-dark mr-4" />
          <Map size={22} className="text-dark" />
        </div>
      </div>

      <div className="filters-row mt-4 px-4">
        <button className="filter-pill primary">
          <SlidersHorizontal size={16} /> Filters
        </button>
        <button className="filter-pill">
          Distance <ChevronDown size={16} />
        </button>
        <button className="filter-pill">
          Price <ChevronDown size={16} />
        </button>
      </div>

      <div className="results-text px-4 mt-4">
        Showing {items.length} items near you
      </div>

      <div className="items-grid px-4 mt-4 pb-24">
        {items.map((item) => (
          <Link to={`/item/${item.id}`} key={item.id} className="grid-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="item-image-wrapper">
              <img src={item.image} alt={item.title} className="grid-item-image" />
              <button className="grid-like-btn" onClick={(e) => { e.preventDefault(); /* toggle like */ }}>
                <Heart size={16} fill={item.liked ? "var(--primary)" : "var(--bg-color)"} stroke={item.liked ? "var(--primary)" : "var(--text-dark)"} />
              </button>
              {item.available && (
                <div className="available-badge">AVAILABLE</div>
              )}
            </div>
            <div className="grid-item-info">
              <h4 className="grid-item-title mt-2">{item.title}</h4>
              <div className="flex-row items-center gap-1 mt-1">
                <MapPin size={12} color="var(--text-light)" />
                <span className="text-light" style={{ fontSize: '12px' }}>{item.distance}</span>
              </div>
              <div className="mt-1">
                <span className="text-primary font-bold" style={{ fontSize: '15px' }}>{item.price.split('/')[0]}</span>
                <span className="text-gray" style={{ fontSize: '12px' }}>/{item.price.split('/')[1]}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
