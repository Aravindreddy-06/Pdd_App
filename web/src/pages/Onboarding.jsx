import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Handshake, Leaf, ShieldCheck, Users, Sparkles, ArrowRight, Heart, Globe, Recycle,
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import Logo from '../components/Logo';
import './Onboarding.css';

/* ── animated counter hook ────────────────────────────────────────────── */
function useCounter(target, duration = 1600, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return value;
}

/* ── data ─────────────────────────────────────────────────────────────── */
const PILLARS = [
  {
    id: 'community',
    icon: <Users size={22} />,
    emoji: '🤝',
    title: 'Community First',
    desc: 'We believe stronger neighborhoods start with small acts of trust — lending a drill, sharing a ladder, or offering a cup of sugar.',
    color: '#3de81e',
    bg: '#eefeed',
  },
  {
    id: 'sustainable',
    icon: <Recycle size={22} />,
    emoji: '♻️',
    title: 'Sustainable Living',
    desc: 'Every shared item is one less product manufactured. Together we reduce waste, lower carbon footprints, and keep money local.',
    color: '#06b6d4',
    bg: '#ecfeff',
  },
  {
    id: 'trust',
    icon: <ShieldCheck size={22} />,
    emoji: '🔒',
    title: 'Verified & Safe',
    desc: 'Verified profiles, transparent ratings, and a strong community code of conduct ensure every interaction is safe and respectful.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    id: 'impact',
    icon: <Globe size={22} />,
    emoji: '🌍',
    title: 'Real-World Impact',
    desc: 'From saving households hundreds of dollars a year to planting seeds of local generosity — the ripple effect is real and measurable.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
];

const STATS = [
  { value: 12400, suffix: '+', label: 'Items Shared' },
  { value: 3800, suffix: '+', label: 'Neighbors Connected' },
  { value: 94, suffix: '%', label: 'Satisfaction Rate' },
  { value: 520, suffix: 'kg', label: 'Waste Prevented' },
];

/* ── component ────────────────────────────────────────────────────────── */
export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activePillar, setActivePillar] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const handleAlreadyHaveAccount = () => {
    const lastLogin = localStorage.getItem('rs_last_login');
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    
    if (lastLogin) {
      const timeSinceLogin = Date.now() - parseInt(lastLogin);
      if (timeSinceLogin < TWO_DAYS_MS) {
        // Within 2 days, skip login and go to home
        navigate('/home');
        return;
      }
    }
    
    // After 2 days or no previous login, require credentials
    navigate('/login');
  };

  /* intersection observer triggers counter animation */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mission-page">

      {/* ── sticky top bar ─────────────────────────────────────────────── */}
      <header className="mission-topbar">
        <div className="mission-logo">
          <Logo size={24} />
          <span>ResourceShare</span>
        </div>
        <button className="mission-skip" onClick={() => navigate('/signup')}>
          Skip <ArrowRight size={14} />
        </button>
      </header>

      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section className="mission-hero">
        <div className="mission-hero-badge">
          <Sparkles size={14} />
          Our Mission
        </div>
        <h1 className="mission-headline">
          Turning Neighbors Into<br />
          <span className="mission-headline-accent">Communities</span>
        </h1>
        <p className="mission-hero-sub">
          ResourceShare is more than an app — it's a movement to rekindle the
          age-old tradition of helping the people next door, powered by modern
          technology and radical trust.
        </p>
        <div className="mission-hero-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Neighbors sharing resources"
            className="mission-hero-img"
          />
          <div className="mission-hero-pill mission-hero-pill--left">
            <Heart size={14} fill="#3de81e" stroke="#3de81e" />
            <span>Built with love</span>
          </div>
          <div className="mission-hero-pill mission-hero-pill--right">
            <Users size={14} />
            <span>3,800+ neighbors</span>
          </div>
        </div>
      </section>

      {/* ── pillars ────────────────────────────────────────────────────── */}
      <section className="mission-pillars">
        <div className="mission-section-label">What We Stand For</div>
        <h2 className="mission-section-title">Our Core Pillars</h2>
        <p className="mission-section-sub">
          Tap any pillar to learn more about the values that drive everything
          we build.
        </p>

        <div className="mission-pillars-grid">
          {PILLARS.map((p) => {
            const isActive = activePillar === p.id;
            return (
              <button
                key={p.id}
                className={`pillar-card ${isActive ? 'pillar-card--active' : ''}`}
                style={{ '--pillar-color': p.color, '--pillar-bg': p.bg }}
                onClick={() => setActivePillar(isActive ? null : p.id)}
                aria-expanded={isActive}
              >
                <div className="pillar-icon-wrap">{p.icon}</div>
                <div className="pillar-emoji">{p.emoji}</div>
                <h3 className="pillar-title">{p.title}</h3>
                <p className={`pillar-desc ${isActive ? 'pillar-desc--visible' : ''}`}>
                  {p.desc}
                </p>
                <div className="pillar-chevron">{isActive ? '−' : '+'}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── stats ──────────────────────────────────────────────────────── */}
      <section className="mission-stats" ref={statsRef}>
        <div className="mission-section-label">Impact in Numbers</div>
        <h2 className="mission-section-title">Growing Every Day</h2>
        <div className="stats-grid">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} active={statsVisible} />
          ))}
        </div>
      </section>

      {/* ── story ──────────────────────────────────────────────────────── */}
      <section className="mission-story">
        <div className="mission-section-label">Our Story</div>
        <h2 className="mission-section-title">Why We Started</h2>
        <div className="story-cards">
          <div className="story-step">
            <div className="story-step-num">01</div>
            <div>
              <h4 className="story-step-title">The Problem</h4>
              <p className="story-step-text">
                Most households own hundreds of items they use only once or twice
                a year. Meanwhile, neighbors spend money buying the same tools
                and gadgets — without ever knowing someone next door already has
                one.
              </p>
            </div>
          </div>
          <div className="story-connector" />
          <div className="story-step">
            <div className="story-step-num">02</div>
            <div>
              <h4 className="story-step-title">The Idea</h4>
              <p className="story-step-text">
                What if a platform existed that made it as easy to borrow your
                neighbor's ladder as it is to order a pizza? ResourceShare was
                born from that simple, powerful question.
              </p>
            </div>
          </div>
          <div className="story-connector" />
          <div className="story-step">
            <div className="story-step-num">03</div>
            <div>
              <h4 className="story-step-title">The Vision</h4>
              <p className="story-step-text">
                A world where every neighborhood is a resilient, self-supporting
                micro-economy — where generosity is the default and trust is the
                currency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── testimonials section ───────────────────────────────────────── */}
      <section className="mission-testimonials">
        <div className="mission-section-label">Real Stories</div>
        <h2 className="mission-section-title">Shared by the Neighborhood</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-text">"I needed a pressure washer for my driveway but didn't want to spend ₹5000. Found Marcus just two blocks away. He even showed me how to use it! We're friends now."</p>
            <div className="testimonial-author">
              <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=84cc16&color=fff" alt="Sarah" className="author-img" />
              <div>
                <div className="author-name">Sarah Jenkins</div>
                <div className="author-meta">Borrowed a Pressure Washer</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">"ResourceShare has paid for my weekend coffee for a year! I lend out my camping gear when I'm not using it. It's so safe and I love knowing it's helping others."</p>
            <div className="testimonial-author">
              <img src="https://ui-avatars.com/api/?name=Marcus+Rodriguez&background=84cc16&color=fff" alt="Marcus" className="author-img" />
              <div>
                <div className="author-name">Marcus Rodriguez</div>
                <div className="author-meta">Lent 12+ items this month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── founders section ─────────────────────────────────────────── */}
      <section className="mission-founders">
        <div className="founders-card">
          <div className="founders-content">
             <h2 className="founders-title">A Message from the Founder</h2>
             <p className="founders-text">
               I started ResourceShare in a small apartment because I realized I didn't know the names of the people living six feet away from me. I believe that technology should bring us closer to the physical world, not further away. My goal isn't just to share tools, but to rebuild the social fabric of our cities.
             </p>
             <div className="founders-signature">
                <span className="sig-text">Aravind kumar Reddy</span>
                <span className="sig-label">Founder</span>
             </div>
          </div>
          <div className="founders-image-wrap founders-logo-wrap">
            <div className="layered-logo-container">
              <Leaf size={180} className="layered-leaf-bg" />
              <Handshake size={100} className="layered-handshake-fg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────── */}
      <section className="mission-faq">
        <div className="mission-section-label">Common Questions</div>
        <h2 className="mission-section-title">Everything You Need to Know</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>What if my item gets damaged?</h4>
            <p>Our Trust Protection covers verified rentals up to ₹10,000. We also facilitate easy security deposits between neighbors.</p>
          </div>
          <div className="faq-item">
            <h4>How do I know who I'm sharing with?</h4>
            <p>Every neighbor must verify their identity and phone number. You can also read ratings from previous interactions.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="mission-cta">
        <div className="mission-cta-inner">
          <Logo size={48} />
          <h2 className="mission-cta-title">Ready to be a good neighbor?</h2>
          <p className="mission-cta-sub">
            Join thousands of people already sharing, saving, and connecting in
            their neighborhoods.
          </p>
          <div className="mission-cta-btns">
            <button
              className="btn btn-primary btn-lg mission-cta-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-outline mission-cta-outline"
              onClick={handleAlreadyHaveAccount}
            >
              I Already Have an Account
            </button>
          </div>
        </div>
      </section>

      {/* ── progress dots ──────────────────────────────────────────────── */}
      <div className="mission-dots">
        <div className="dot dot-active" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );
}

/* ── stat card sub-component ──────────────────────────────────────────── */
function StatCard({ value, suffix, label, active }) {
  const count = useCounter(value, 1800, active);
  return (
    <div className="stat-card">
      <span className="stat-value">
        {count.toLocaleString()}
        <span className="stat-suffix">{suffix}</span>
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
