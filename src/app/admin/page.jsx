'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import AreaChartWidget from '@/components/admin/charts/AreaChartWidget';
import DonutChartWidget from '@/components/admin/charts/DonutChartWidget';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SelectFilter from '@/components/admin/forms/SelectFilter';
import EmptyState from '@/components/admin/feedback/EmptyState';
import { apiFetch } from '@/services/api';
import { DollarSign, ArrowDownLeft, ArrowUpRight, TrendingUp, Users, Gamepad2, ShieldAlert, RefreshCw, Activity, Layers } from 'lucide-react';

export default function OverviewDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboard();
  }, [timeRange]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/dashboard');
      if (res.status && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fin = data?.financials || {};
  const usr = data?.users || {};
  const gms = data?.games || {};
  const sec = data?.security || {};
  const alerts = sec.recentAlerts || [];
  const auditLogs = data?.recentAuditLogs || [];

  // Real 7-day revenue trend directly from MongoDB API
  const revenueChartData = fin.revenueTrend || [
    { name: 'Mon', revenue: 0 },
    { name: 'Tue', revenue: 0 },
    { name: 'Wed', revenue: 0 },
    { name: 'Thu', revenue: 0 },
    { name: 'Fri', revenue: 0 },
    { name: 'Sat', revenue: 0 },
    { name: 'Sun', revenue: 0 }
  ];

  // Real Game Status breakdown directly from DB
  const gameDonutData = [
    { name: 'Completed', value: gms.completed || 0, color: '#10b981' },
    { name: 'Pending Result', value: data?.pending?.disputes || 0, color: '#f59e0b' },
    { name: 'Disputed', value: gms.disputed || 0, color: '#f43f5e' },
    { name: 'Cancelled', value: gms.cancelled || 0, color: '#64748b' }
  ];

  const totalGameCount = (gms.completed || 0) + (data?.pending?.disputes || 0) + (gms.disputed || 0) + (gms.cancelled || 0);

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title Header with Range Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">PLATFORM OPERATIONAL COMMAND CENTER</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Platform Operations & Financial Telemetry
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SelectFilter
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { label: 'Last 24 Hours', value: '24h' },
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'Last 90 Days', value: '90d' }
              ]}
            />
            <button
              onClick={fetchDashboard}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--emerald-light)',
                fontWeight: 800,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} /> Sync Metrics
            </button>
          </div>
        </div>

        {/* Row 1: 4 Financial KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Total Wallet Balance"
            value={`₹${(fin.totalWalletBalanceRs || 0).toLocaleString('en-IN')}`}
            trend="Live DB aggregate"
            trendType="up"
            icon={DollarSign}
            badgeText="Live DB"
            badgeColor="emerald"
          />
          <StatCard
            title="Today's Deposits"
            value={`₹${(fin.deposits?.todayRs || 0).toLocaleString('en-IN')}`}
            trend="Today's inflow"
            trendType="up"
            icon={ArrowDownLeft}
            badgeText="Inflow"
            badgeColor="emerald"
          />
          <StatCard
            title="Today's Cashouts"
            value={`₹${(fin.withdrawals?.todayRs || 0).toLocaleString('en-IN')}`}
            trend="Approved & Processed"
            trendType="neutral"
            icon={ArrowUpRight}
            badgeText="Outflow"
            badgeColor="rose"
          />
          <StatCard
            title="Platform Revenue (Fees)"
            value={`₹${(fin.revenueRs || 0).toLocaleString('en-IN')}`}
            trend="GGR Cut"
            trendType="up"
            icon={TrendingUp}
            badgeText="GGR"
            badgeColor="gold"
          />
        </div>

        {/* Row 2: 4 User & Game Telemetry Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Active Players Today"
            value={(usr.active || 0).toLocaleString('en-IN')}
            trend={`+${usr.newToday || 0} registered today`}
            trendType="up"
            icon={Users}
          />
          <StatCard
            title="Games Running Now"
            value={(gms.running || 0).toLocaleString('en-IN')}
            trend="Live rooms"
            trendType="up"
            icon={Gamepad2}
            badgeText="Live"
            badgeColor="emerald"
          />
          <StatCard
            title="Pending Cashouts Queue"
            value={(data?.pending?.withdrawals || 0).toLocaleString('en-IN')}
            trend="Needs Admin Review"
            trendType="down"
            icon={ArrowUpRight}
            badgeText="Review"
            badgeColor="gold"
          />
          <StatCard
            title="Unresolved Disputes"
            value={(data?.pending?.disputes || 0).toLocaleString('en-IN')}
            trend="Needs Resolution"
            trendType="down"
            icon={ShieldAlert}
            badgeText="Risk"
            badgeColor="rose"
          />
        </div>

        {/* Row 3: Revenue Analytics Chart & Game Status Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="Platform Financial Analytics" subtitle="Daily revenue fee cut vs deposits & withdrawals (Real MongoDB trend)" loading={loading}>
            <AreaChartWidget data={revenueChartData} xKey="name" yKey="revenue" color="#10b981" formatY={(v) => `₹${(v/1000).toFixed(1)}k`} />
          </ChartCard>

          <ChartCard title="Game Status Breakdown" subtitle="Distribution of match room outcomes" loading={loading}>
            {totalGameCount === 0 ? (
              <EmptyState title="No Match Outcomes" description="No game matches recorded in MongoDB database." />
            ) : (
              <DonutChartWidget data={gameDonutData} />
            )}
          </ChartCard>
        </div>

        {/* Row 4: Security Alerts & Recent Activity Stream */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="micro-label">SECURITY MATRIX</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>Active Security Alerts</h3>
              </div>
              <StatusBadge status={sec.unresolvedAlertsCount > 0 ? 'HIGH' : 'ACTIVE'} text={`${sec.unresolvedAlertsCount || 0} Unresolved`} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--emerald-light)', backgroundColor: 'var(--surface-1)', borderRadius: 'var(--radius-md)' }}>
                  <ShieldAlert size={28} style={{ margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontWeight: 800 }}>No Active Security Threat Signals</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>All multi-signal risk matrices clear in MongoDB.</div>
                </div>
              ) : (
                alerts.map((al, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <ShieldAlert size={18} color="var(--rose)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{al.title || al.description}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(al.createdAt || Date.now()).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div className="micro-label">AUDIT FEED</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>Live Admin Operations Feed</h3>
            </div>

            {auditLogs.length === 0 ? (
              <EmptyState title="No Audit Log Activity" description="No administrative operations recorded in MongoDB." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
                {auditLogs.map((log, idx) => (
                  <div key={log._id || idx} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><strong style={{ color: 'var(--emerald-light)' }}>{log.adminUsername || 'Admin'}</strong> {log.action} ({log.module})</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
