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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel card-hover" style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color="#818cf8" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
            <span className="badge-emerald">● {users?.active || 0} Active Accounts</span>
          </div>
        </div>

        <div className="glass-panel card-hover" style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Platform Revenue (GGR)
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#34d399', marginTop: '0.375rem', lineHeight: 1.1 }}>
                ₹{financials?.ggrRs || 0}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={24} color="#10b981" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Estimated 10% Match Commission Fee
          </div>
        </div>

        <div className="glass-panel card-hover" style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Match Disputes
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: pending?.disputes > 0 ? '#fbbf24' : '#ffffff', marginTop: '0.375rem', lineHeight: 1.1 }}>
                {pending?.disputes || 0}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} color="#fbbf24" />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className={pending?.disputes > 0 ? "badge-gold" : "badge-emerald"}>
              {pending?.disputes > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
        </div>

        <div className="glass-panel card-hover" style={{ borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUpRight size={24} color="#f43f5e" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#f87171' }}>
            <span className="badge-rose">{pending?.withdrawals || 0} Cashout Requests</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '20px', padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Wallet size={22} color="#fbbf24" />
          System Financial Ledger & User Sub-Balances
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total User Deposits
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.375rem' }}>
              ₹{financials?.totalDepositsRs || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Processed Cashouts
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f43f5e', marginTop: '0.375rem' }}>
              ₹{financials?.totalWithdrawalsRs || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              User Winning Balances
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', marginTop: '0.375rem' }}>
              ₹{financials?.walletBalancesRs?.winning || 0}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '14px' }}>
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
