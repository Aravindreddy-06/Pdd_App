import React from 'react';
import { Activity, Star, ArrowDown, ArrowUp, ShieldCheck } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import './Impact.css';

export default function Impact() {
  const context = useUser();
  const user = context?.user;

  if (!user) {
    return (
      <div className="page-container flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <Activity size={48} className="spinning mb-4" style={{ color: 'var(--primary)' }} />
        <p className="text-gray">Loading impact data...</p>
      </div>
    );
  }

  const borrowed = Number(user?.borrowed) || 0;
  const shared   = Number(user?.shared)   || 0;
  const rating   = Number(user?.rating)   || 0;

  const stats = [
    {
      id: 1,
      label: 'Total Transactions',
      value: String(borrowed + shared),
      icon: Activity,
      iconColor: '#84cc16',
      iconBg: 'rgba(132, 204, 22, 0.12)',
    },
    {
      id: 2,
      label: 'My Borrowings',
      value: String(borrowed),
      icon: ArrowDown,
      iconColor: '#84cc16',
      iconBg: 'rgba(132, 204, 22, 0.12)',
    },
    {
      id: 3,
      label: 'My Lendings',
      value: String(shared),
      icon: ArrowUp,
      iconColor: '#84cc16',
      iconBg: 'rgba(132, 204, 22, 0.12)',
    },
    {
      id: 4,
      label: 'Community Rating',
      value: rating === 0 ? '0.0' : rating.toFixed(1),
      icon: Star,
      iconColor: '#84cc16',
      iconBg: 'rgba(132, 204, 22, 0.12)',
    },
  ];

  return (
    <div className="page-container impact-page">
      <header className="impact-header">
        <h1>Your Real-World Impact</h1>
        <p>Track your contribution to the community. Every item you lend helps a neighbor, and every item you borrow builds trust.</p>
      </header>

      <div className="impact-grid">
        {stats.map(({ id, label, value, icon: Icon, iconColor, iconBg }) => (
          <div key={id} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: iconBg, color: iconColor }}>
              <Icon size={28} fill={id === 4 ? 'currentColor' : 'none'} strokeWidth={2.5} />
            </div>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex-row justify-center mt-8">
        <div
          className="card text-center"
          style={{
            maxWidth: '600px',
            width: '100%',
            padding: '32px 24px',
            borderRadius: '24px',
            background: 'linear-gradient(160deg, rgba(132,204,22,0.08), rgba(13,15,2,0.85))',
            border: '1px solid rgba(132,204,22,0.2)',
          }}
        >
          <ShieldCheck size={44} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Community Trust</h3>
          <p className="text-gray mt-2" style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: '480px', margin: '8px auto 0' }}>
            Your impact is built on a foundation of trust. High ratings and consistent sharing earn you "Trusted Neighbor" status.
          </p>
        </div>
      </div>
    </div>
  );
}
