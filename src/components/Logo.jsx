import React, { useState } from 'react';
import { Leaf, Handshake } from 'lucide-react';
import './Logo.css';

export default function Logo({ size = 28, className = '' }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    const leafSize = size;
    const handSize = size * 0.55;
    return (
      <div className={`rs-logo-container ${className}`} style={{ width: size, height: size }}>
        <Leaf size={leafSize} className="rs-logo-leaf" />
        <Handshake size={handSize} className="rs-logo-hand" />
      </div>
    );
  }

  return (
    <img 
      src="/favicon.png" 
      alt="Lendkart" 
      className={`rs-logo-img ${className}`}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: '6px' }}
      onError={(e) => {
        if (e.target.src.includes('favicon.png')) {
          e.target.src = '/fevicon.png';
        } else {
          setImgError(true);
        }
      }}
    />
  );
}
