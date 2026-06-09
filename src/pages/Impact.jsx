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

      <section className="impact-details">
        <h3 style={{ marginBottom: '8px' }}>Milestones &amp; Achievements</h3>
        <p className="text-gray" style={{ marginBottom: '24px', fontSize: '14px' }}>Unlock badges as you participate in the community.</p>

        {[
          {
            title: 'First-Time Borrower',
            desc: 'Successfully borrowed your first item from a neighbor.',
            stat: borrowed > 0 ? '✅ Achieved' : '🔒 Locked',
            achieved: borrowed > 0,
          },
          {
            title: 'Generous Neighbor',
            desc: 'Lent your first item to someone in the community.',
            stat: shared > 0 ? '✅ Achieved' : '🔒 Locked',
            achieved: shared > 0,
          },
          {
            title: 'Power Lender',
            desc: 'Lend 10 items to reach the next level of community trust.',
            stat: `${shared}/10`,
            achieved: shared >= 10,
          },
          {
            title: 'Active Borrower',
            desc: 'Borrow 10 unique items to become a master requester.',
            stat: `${borrowed}/10`,
            achieved: borrowed >= 10,
          },
        ].map(({ title, desc, stat, achieved }) => (
          <div className="detail-row" key={title}>
            <div className="detail-info">
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
            <div
              className="detail-stat"
              style={{ color: achieved ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}
            >
              {stat}
            </div>
          </div>
        ))}
      </section>

      <div className="flex-row justify-center mt-12">
        <div
          className="card text-center"
          style={{
            maxWidth: '600px',
            background: 'linear-gradient(160deg, rgba(132,204,22,0.08), rgba(13,15,2,0.8))',
            border: '1px solid rgba(132,204,22,0.2)',
          }}
        >
          <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3>Community Trust</h3>
          <p className="text-gray mt-2">
            Your impact is built on a foundation of trust. High ratings and consistent sharing earn you "Trusted Neighbor" status.
          </p>
        </div>
      </div>
    </div>
  );
}
