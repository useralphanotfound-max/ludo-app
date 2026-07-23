'use client';

import React, { useEffect, useState } from 'react';
import { Users, DollarSign, AlertTriangle, PlayCircle, ShieldCheck, Activity, ArrowUpRight, Wallet, Sparkles, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import LudoLoader from '@/components/common/LudoLoader';

export default function DashboardView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
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
    return <LudoLoader text="Fetching Royal Telemetry & Platform Financials..." />;
  }

  const { users, pending, live, financials } = metrics || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            System Dashboard Overview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel card-hover card-blue-border" style={{ borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Registered Users
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                {users?.total || 0}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.35)'
            }}>
              <Users size={24} color="#ffffff" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
            <span className="badge-emerald">● {users?.active || 0} Active Accounts</span>
          </div>
        </div>

        <div className="glass-panel card-hover card-green-border" style={{ borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Platform Revenue (GGR)
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#4ade80', marginTop: '0.375rem', lineHeight: 1.1 }}>
                ₹{financials?.ggrRs || 0}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(34, 197, 94, 0.35)'
            }}>
              <DollarSign size={24} color="#0a0c16" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Estimated 10% Match Commission Fee
          </div>
        </div>

        <div className="glass-panel card-hover card-gold-border" style={{ borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pending Match Disputes
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: pending?.disputes > 0 ? '#facc15' : '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                {pending?.disputes || 0}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(250, 204, 21, 0.35)'
            }}>
              <AlertTriangle size={24} color="#0a0c16" />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className={pending?.disputes > 0 ? "badge-gold" : "badge-emerald"}>
              {pending?.disputes > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
        </div>

        <div className="glass-panel card-hover card-red-border" style={{ borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pending Cashout Queue
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                ₹{financials?.pendingWithdrawalsRs || 0}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)'
            }}>
              <ArrowUpRight size={24} color="#ffffff" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#f87171' }}>
            <span className="badge-rose">{pending?.withdrawals || 0} Cashout Requests</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '20px', padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Wallet size={22} color="#facc15" />
          System Financial Ledger & User Sub-Balances
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#0a0c16', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total User Deposits
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#60a5fa', marginTop: '0.375rem' }}>
              ₹{financials?.totalDepositsRs || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#0a0c16', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Processed Cashouts
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f87171', marginTop: '0.375rem' }}>
              ₹{financials?.totalWithdrawalsRs || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#0a0c16', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              User Winning Balances
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4ade80', marginTop: '0.375rem' }}>
              ₹{financials?.walletBalancesRs?.winning || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#0a0c16', border: '1px solid rgba(250, 204, 21, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              User Bonus Balances
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#facc15', marginTop: '0.375rem' }}>
              ₹{financials?.walletBalancesRs?.bonus || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
