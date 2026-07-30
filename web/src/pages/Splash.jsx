import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import Logo from '../components/Logo';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Locating neighbors nearby...",
    "Syncing community inventory...",
    "Securing trust protocols...",
    "Ready to share!"
  ];

  useEffect(() => {
    // Step progression animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 650);

    // Final navigation: after loading splash completes, navigate directly to /signup (Create Account)
    const timer = setTimeout(() => {
      navigate('/signup', { replace: true });
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearInterval(stepInterval);
    };
  }, [navigate, steps.length]);

  return (
    <div className="container flex-col items-center splash-bg">
      {/* ── Gradient Definition (Hidden) ── */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="handshake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      {/* ── Background Elements ── */}
      <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '5%' }}></div>
      <div className="particle" style={{ width: '150px', height: '150px', bottom: '15%', right: '10%', animationDelay: '-5s' }}></div>
      <div className="particle" style={{ width: '80px', height: '80px', top: '40%', right: '20%', animationDelay: '-12s' }}></div>

      {/* ── Logo Section ── */}
      <div className="logo-wrapper">
        <div className="logo-circle">
          <Logo size={56} />
        </div>
        <div className="orbiting-icon icon-1">
          <span role="img" aria-label="cart">📦</span>
        </div>
        <div className="orbiting-icon icon-2">
          <span role="img" aria-label="trust">🛡️</span>
        </div>
        <div className="orbiting-icon icon-3">
          <span role="img" aria-label="heart">❤️</span>
        </div>
      </div>
      
      <h1 className="splash-title">
        Lend<span className="text-primary">kart</span>
      </h1>
      <p className="splash-subtitle">Community Rental Marketplace</p>

      {/* ── Loading Card ── */}
      <div className="loading-card">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={index} className={`step ${index <= currentStep ? 'active' : ''}`}>
              <div className="step-dot"></div>
              <span>{step}</span>
              {index === currentStep && index < steps.length - 1 && (
                <Zap size={14} className="ml-auto" style={{ animation: 'pulse 1s infinite' }} />
              )}
            </div>
          ))}
        </div>
        
        <div className="progress-bar-premium">
          <div className="progress-fill-premium"></div>
        </div>
        <span className="loading-label">Initializing community...</span>
      </div>
    </div>
  );
}
