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
import { DollarSign, ArrowDownLeft, ArrowUpRight, TrendingUp, Users, Gamepad2, ShieldAlert, RefreshCw } from 'lucide-react';

export default function OverviewDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => { fetchDashboard(); }, [timeRange]);

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

  const revenueChartData = fin.revenueTrend?.length ? fin.revenueTrend : [];

  const hasGameData = gms.completed > 0 || (data?.pending?.disputes || 0) > 0 || gms.disputed > 0 || gms.cancelled > 0;
  const gameDonutData = hasGameData ? [
    { name: 'Completed', value: gms.completed || 0, color: '#10b981' },
    { name: 'Pending Result', value: data?.pending?.disputes || 0, color: '#f59e0b' },
    { name: 'Disputed', value: gms.disputed || 0, color: '#f43f5e' },
    { name: 'Cancelled', value: gms.cancelled || 0, color: '#64748b' }
  ] : [];

  return (
    <AppShell>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <div className="micro-label">ADMIN OVERVIEW DASHBOARD</div>
            <h1 className="admin-page-title">Royal Ludo Control Center</h1>
          </div>
          <div className="admin-header-actions">
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
            <button onClick={fetchDashboard} className="btn btn-ghost">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid-auto">
          <StatCard
            title="Total Wallet Balance"
            value={`₹${(fin.totalWalletBalanceRs || 0).toLocaleString('en-IN')}`}
            trend="Live DB aggregate"
            trendType="up"
            icon={DollarSign}
            badgeColor="emerald"
          />
          <StatCard
            title="Today's Deposits"
            value={`₹${(fin.deposits?.todayRs || 0).toLocaleString('en-IN')}`}
            trend="Today's inflow"
            trendType="up"
            icon={ArrowDownLeft}
            badgeColor="emerald"
          />
          <StatCard
            title="Today's Cashouts"
            value={`₹${(fin.withdrawals?.todayRs || 0).toLocaleString('en-IN')}`}
            trend="Approved & processed"
            trendType="neutral"
            icon={ArrowUpRight}
            badgeColor="rose"
          />
          <StatCard
            title="Platform Revenue"
            value={`₹${(fin.revenueRs || 0).toLocaleString('en-IN')}`}
            trend="GGR cut"
            trendType="up"
            icon={TrendingUp}
            badgeColor="gold"
          />
        </div>

        {/* User & Game KPIs */}
        <div className="grid-auto">
          <StatCard
            title="Active Players"
            value={(usr.active || 0).toLocaleString('en-IN')}
            trend={`+${usr.newToday || 0} registered today`}
            trendType="up"
            icon={Users}
          />
          <StatCard
            title="Live Games"
            value={(gms.running || 0).toLocaleString('en-IN')}
            trend="Running now"
            trendType="up"
            icon={Gamepad2}
            badgeColor="emerald"
          />
          <StatCard
            title="Pending Cashouts"
            value={(data?.pending?.withdrawals || 0).toLocaleString('en-IN')}
            trend="Needs admin review"
            trendType="down"
            icon={ArrowUpRight}
            badgeColor="gold"
          />
          <StatCard
            title="Unresolved Disputes"
            value={(data?.pending?.disputes || 0).toLocaleString('en-IN')}
            trend="Needs resolution"
            trendType="down"
            icon={ShieldAlert}
            badgeColor="rose"
          />
        </div>

        {/* Charts Row */}
        <div className="grid-2-1">
          <ChartCard title="Platform Revenue Analytics" subtitle="Daily revenue trend from MongoDB" loading={loading}>
            {revenueChartData.length > 0 ? (
              <AreaChartWidget data={revenueChartData} xKey="name" yKey="revenue" color="#10b981" formatY={(v) => `₹${v.toLocaleString('en-IN')}`} />
            ) : (
              <EmptyState title="No Revenue Data" description="No completed matches recorded yet." />
            )}
          </ChartCard>

          <ChartCard title="Game Status Breakdown" subtitle="Match outcome distribution" loading={loading}>
            {hasGameData ? (
              <DonutChartWidget data={gameDonutData} />
            ) : (
              <EmptyState title="No Match Data" description="No game matches recorded in database." />
            )}
          </ChartCard>
        </div>

        {/* Security & Audit Feed */}
        <div className="grid-2">
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="micro-label">SECURITY MATRIX</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>Security Alerts</h3>
              </div>
              <StatusBadge status={sec.unresolvedAlertsCount > 0 ? 'HIGH' : 'ACTIVE'} text={`${sec.unresolvedAlertsCount || 0} Unresolved`} />
            </div>

            {alerts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--emerald-light)', backgroundColor: 'var(--surface-1)', borderRadius: 'var(--radius-md)' }}>
                <ShieldAlert size={26} style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>No Active Threats</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>All risk matrices clear.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {alerts.map((al, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                    <ShieldAlert size={16} color="var(--rose)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>{al.title || al.description}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(al.createdAt || Date.now()).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div className="micro-label">AUDIT FEED</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>Admin Operations Log</h3>
            </div>
            {auditLogs.length === 0 ? (
              <EmptyState title="No Audit Activity" description="No administrative operations recorded yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                {auditLogs.map((log, idx) => (
                  <div key={log._id || idx} style={{ padding: '0.7rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ color: 'var(--emerald-light)' }}>{log.adminUsername || 'Admin'}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}> {log.action}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
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
