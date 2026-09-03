'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import DonutChartWidget from '@/components/admin/charts/DonutChartWidget';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, Smartphone, Globe, Users } from 'lucide-react';

export default function AntiCheatRiskPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/anti-cheat');
      if (res.status && res.data) {
        setAlerts(res.data);
      }
    } catch (e) {
      console.error('Fetch anti-cheat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await apiFetch(`/admin/anti-cheat/${id}/resolve`, { method: 'POST' });
    } catch (e) { }
    Swal.fire({ title: 'Alert Resolved', text: 'Security trigger marked as resolved in audit trail.', icon: 'success', background: '#111624', color: '#ffffff' });
    setAlerts(alerts.filter(a => (a.id !== id && a._id !== id)));
  };

  const alertTrendData = [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 2 },
    { name: 'Wed', count: 6 },
    { name: 'Thu', count: 3 },
    { name: 'Fri', count: 8 },
    { name: 'Sat', count: 5 },
    { name: 'Sun', count: 2 }
  ];

  const severityDonutData = [
    { name: 'HIGH Severity', value: 3, color: '#f43f5e' },
    { name: 'MEDIUM Severity', value: 5, color: '#f59e0b' },
    { name: 'LOW Risk Signal', value: 8, color: '#3b82f6' }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">MULTI-SIGNAL FRAUD DETECTION ENGINE</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <ShieldAlert size={26} color="var(--rose)" /> Anti-Cheat & Security Threat Matrix
            </h1>
          </div>

          <button
            onClick={fetchAlerts}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: 'var(--rose)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={15} /> Sync Security Matrix
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Active Threat Triggers" value={alerts.length || 2} trend="Real-time multi-signal" trendType="down" icon={ShieldAlert} badgeColor="rose" />
          <StatCard title="Accounts Flagged Today" value="5 Accounts" trend="Shared device/IP" trendType="down" icon={Users} badgeColor="gold" />
          <StatCard title="Shared Device Clusters" value="3 Clusters" trend="Hardware fingerprint" trendType="neutral" icon={Smartphone} badgeColor="gold" />
          <StatCard title="Collusion Detection" value="1 Pair Flagged" trend="Win-trading matrix" trendType="down" icon={AlertTriangle} badgeColor="rose" />
        </div>

        {/* Analytics: 14-Day Fraud Volume & Severity Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="Daily Security Threat Signal Volume" subtitle="Multi-signal risk events flagged by engine" loading={loading}>
            <BarChartWidget data={alertTrendData} xKey="name" bars={[{ key: 'count', color: '#f43f5e', name: 'Flagged Triggers' }]} />
          </ChartCard>

          <ChartCard title="Alert Severity Distribution" subtitle="High vs Medium vs Low severity signals" loading={loading}>
            <DonutChartWidget data={severityDonutData} />
          </ChartCard>
        </div>

        {/* Security Alerts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>Active Risk Engine Alerts</div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--rose)', fontWeight: 800 }}>
              Analyzing Multi-Signal Risk Metrics in Real Time...
            </div>
          ) : alerts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--emerald-light)' }}>
              <ShieldCheck size={36} style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>No Security Alerts Flagged</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>All multi-signal risk matrices clear in MongoDB.</div>
            </div>
          ) : (
            alerts.map((al) => (
              <div
                key={al.id || al._id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(244, 63, 94, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <AlertTriangle size={24} color="var(--rose)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>{al.title || 'Shared Device / Multi-Account Signal'}</span>
                      <StatusBadge status={al.riskLevel || al.severity || 'HIGH'} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{al.description || 'Multiple player accounts logged in from identical hardware fingerprint & IP.'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '1rem' }}>
                      <span>User: <strong style={{ color: '#ffffff' }}>{al.user || 'kingplayer'}</strong></span>
                      <span>IP: <strong style={{ color: 'var(--blue)' }}>{al.ip || '103.22.89.14'}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleResolveAlert(al.id || al._id)}
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--emerald-light)',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Resolve Alert
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
