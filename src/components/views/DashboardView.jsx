import React, { useEffect, useState } from 'react';
import { Users, DollarSign, AlertTriangle, PlayCircle, ShieldCheck, Activity, ArrowUpRight, Wallet, Sparkles, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function DashboardView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await apiFetch('/admin/dashboard');
      if (res.status) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center', fontSize: '1rem' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#f59e0b' }} />
        Loading Superadmin Telemetry & System Metrics...
      </div>
    );
  }

  const { users, pending, live, financials } = metrics || {};

  return (
    <div>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            System Dashboard Overview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Real-time platform telemetry, user totals, financial balances, and live dispute queues.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Primary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Card 1: Users */}
        <div className="glass-panel card-hover" style={{ borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Registered Users
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                {users?.total || 0}
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={22} color="#38bdf8" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
            <span className="badge-emerald">● {users?.active || 0} Active Accounts</span>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="glass-panel card-hover" style={{ borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Platform Revenue (GGR)
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#34d399', marginTop: '0.375rem', lineHeight: 1.1 }}>
                ₹{financials?.ggrRs || 0}
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={22} color="#10b981" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
            Estimated 10% Match Platform Commission
          </div>
        </div>

        {/* Card 3: Pending Disputes */}
        <div className="glass-panel card-hover" style={{ borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Match Disputes
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: pending?.disputes > 0 ? '#f59e0b' : '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                {pending?.disputes || 0}
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={22} color="#f59e0b" />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className={pending?.disputes > 0 ? "badge-gold" : "badge-emerald"}>
              {pending?.disputes > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
        </div>

        {/* Card 4: Pending Cashouts */}
        <div className="glass-panel card-hover" style={{ borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Cashout Queue
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                ₹{financials?.pendingWithdrawalsRs || 0}
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUpRight size={22} color="#f43f5e" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#f87171' }}>
            <span className="badge-rose">{pending?.withdrawals || 0} Cashout Requests</span>
          </div>
        </div>
      </div>

      {/* Financial Breakdown Section */}
      <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Wallet size={22} color="#f59e0b" />
          System Financial Ledger & User Sub-Balances
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total User Deposits
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.375rem' }}>
              ₹{financials?.totalDepositsRs || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Processed Cashouts
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f43f5e', marginTop: '0.375rem' }}>
              ₹{financials?.totalWithdrawalsRs || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              User Winning Balances
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', marginTop: '0.375rem' }}>
              ₹{financials?.walletBalancesRs?.winning || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              User Bonus Balances
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.375rem' }}>
              ₹{financials?.walletBalancesRs?.bonus || 0}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
