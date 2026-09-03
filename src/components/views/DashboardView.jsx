'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2, Clock, Scale, XCircle, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';

export default function DashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/dashboard');
      if (res.status && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <RefreshCw size={28} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
          Syncing Live MongoDB Platform Metrics...
        </div>
      </div>
    );
  }

  const fin = data?.financials || {};
  const usr = data?.users || {};
  const gms = data?.games || {};
  const sec = data?.security || {};
  const alerts = sec.recentAlerts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          LIVE PLATFORM OVERVIEW
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
          Platform health — last 24 hours
        </h1>
      </div>

      {/* Row 1: 4 Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {/* Total Wallet Balance */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Total Wallet Balance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            ₹{(fin.totalWalletBalanceRs ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>Live DB</span>
          </div>
        </div>

        {/* Today's Deposits */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Today's Deposits</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            ₹{(fin.deposits?.todayRs ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>Today</span>
          </div>
        </div>

        {/* Today's Withdrawals */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Today's Withdrawals</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            ₹{(fin.withdrawals?.todayRs ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingDown size={14} /> <span>Approved</span>
          </div>
        </div>

        {/* Platform Revenue */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Platform Revenue (fees)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            ₹{(fin.revenueRs ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>GGR</span>
          </div>
        </div>
      </div>

      {/* Row 2: 4 User & Game KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {/* Active Users */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Active Users</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            {(usr.active ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>+{usr.newToday ?? 0} today</span>
          </div>
        </div>

        {/* New Today */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>New Today</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            {(usr.newToday ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>Registrations</span>
          </div>
        </div>

        {/* Suspended */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Suspended</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            {usr.suspended ?? 0}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingDown size={14} /> <span>Accounts</span>
          </div>
        </div>

        {/* Games Running Now */}
        <div style={{ backgroundColor: '#121727', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Games Running Now</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 6px 0', letterSpacing: '-0.02em' }}>
            {(gms.running ?? 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> <span>Live rooms</span>
          </div>
        </div>
      </div>

      {/* Row 3: Split View (SECURITY Active Alerts vs GAMES Game Status) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        {/* SECURITY -> Active Alerts */}
        <div style={{ backgroundColor: '#121727', padding: '1.35rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SECURITY</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>Active alerts</h3>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: sec.unresolvedAlertsCount > 0 ? '#f87171' : '#34d399', backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
              {sec.unresolvedAlertsCount ?? 0} Unresolved
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#34d399', backgroundColor: '#171e32', borderRadius: '12px' }}>
                <ShieldCheck size={32} style={{ margin: '0 auto 0.5rem auto', color: '#10b981' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>No Active Security Alerts</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>All security threat signals clear in MongoDB.</div>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} style={{ padding: '0.85rem 1rem', backgroundColor: '#171e32', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <AlertTriangle size={17} color={alert.riskLevel === 'HIGH' ? '#f87171' : '#fbbf24'} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}>
                      {alert.title || alert.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Recently'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GAMES -> Game Status 4-Grid */}
        <div style={{ backgroundColor: '#121727', padding: '1.35rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GAMES</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>Game status</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem' }}>
            {/* Completed */}
            <div style={{ backgroundColor: '#171e32', padding: '1.15rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Completed</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                {(gms.completed ?? 0).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Result Pending */}
            <div style={{ backgroundColor: '#171e32', padding: '1.15rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                <Clock size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Result Pending</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                {(data?.pending?.disputes ?? 0).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Disputed */}
            <div style={{ backgroundColor: '#171e32', padding: '1.15rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6' }}>
                <Scale size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Disputed</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                {(gms.disputed ?? 0).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Cancelled */}
            <div style={{ backgroundColor: '#171e32', padding: '1.15rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                <XCircle size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Cancelled</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                {(gms.cancelled ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
