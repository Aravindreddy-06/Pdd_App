import React from 'react';
import { Leaf, Handshake } from 'lucide-react';
import './Logo.css';

export default function Logo({ size = 28 }) {
  const leafSize = size;
  const handSize = size * 0.55;

  return (
    <div className="rs-logo-container" style={{ width: size, height: size }}>
      <Leaf size={leafSize} className="rs-logo-leaf" />
      <Handshake size={handSize} className="rs-logo-hand" />
    </div>
  );
}
