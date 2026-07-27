import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Plus, Trash2, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './PaymentMethodsManager.css';

export default function PaymentMethodsManager() {
  const [methods, setMethods] = useState([
    { id: '1', type: 'card', brand: 'Visa', last4: '4242', exp_month: 12, exp_year: 28, is_default: true },
    { id: '2', type: 'upi', upi_id: 'alex@okaxis', brand: 'UPI', is_default: false },
  ]);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaymentData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch saved methods from Supabase
          const { data: pmData } = await supabase
            .from('saved_payment_methods')
            .select('*')
            .eq('user_id', session.user.id);
          
          if (pmData && pmData.length > 0) {
            setMethods(pmData);
          }

          // Fetch orders history from Supabase
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (ordersData) {
            setOrdersHistory(ordersData);
          }
        }
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPaymentData();
  }, []);

  const handleDeleteMethod = async (id) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    try {
      await supabase.from('saved_payment_methods').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pm-manager-container">
      {/* Saved Methods Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Saved Payment Methods
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {methods.map((item) => (
            <div key={item.id} className="pm-card-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="pm-icon-badge">
                  {item.type === 'card' ? <CreditCard size={20} /> : <Smartphone size={20} />}
                </div>
                <div className="pm-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4>{item.type === 'card' ? `${item.brand} •••• ${item.last4}` : item.upi_id}</h4>
                    {item.is_default && <span className="badge-default">DEFAULT</span>}
                  </div>
                  <p>{item.type === 'card' ? `Expires ${item.exp_month}/${item.exp_year}` : 'UPI ID'}</p>
                </div>
              </div>

              <button
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
                onClick={() => handleDeleteMethod(item.id)}
                title="Remove method"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Section */}
      <div style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
          Recent Transactions
        </h3>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
          {ordersHistory.length === 0 ? (
            <div className="history-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#22c55e" />
                <div>
                  <h5 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>Lawn Mower Rental</h5>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Paid via Card • May 24</span>
                </div>
              </div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹30.00</strong>
            </div>
          ) : (
            ordersHistory.map(ord => (
              <div key={ord.id} className="history-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color={ord.status === 'succeeded' ? '#22c55e' : '#f59e0b'} />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>
                      Order #{ord.id.slice(0, 8)}
                    </h5>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {ord.payment_method?.toUpperCase()} • {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                  ₹{(ord.amount / 100).toFixed(2)}
                </strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
