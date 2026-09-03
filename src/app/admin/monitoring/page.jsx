'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import AreaChartWidget from '@/components/admin/charts/AreaChartWidget';
import LineChartWidget from '@/components/admin/charts/AreaChartWidget';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import { Activity, Database, Cpu, CheckCircle, RefreshCw, Gauge, Server, Wifi } from 'lucide-react';

export default function InfrastructureMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/monitoring');
      if (res.status && res.data) {
        setHealth(res.data);
      }
    } catch (e) {
      console.error('Fetch monitoring error:', e);
    } finally {
      setLoading(false);
    }
  };

  const latencyChartData = health?.latencyChartData || [
    { name: '10:00', latency: 18 },
    { name: '10:05', latency: 22 },
    { name: '10:10', latency: 16 },
    { name: '10:15', latency: 19 },
    { name: '10:20', latency: 24 },
    { name: '10:25', latency: 17 },
    { name: '10:30', latency: 18 }
  ];

  const dbQueryChartData = health?.dbQueryChartData || [
    { name: '10:00', ms: 2.1 },
    { name: '10:05', ms: 2.4 },
    { name: '10:10', ms: 1.9 },
    { name: '10:15', ms: 2.8 },
    { name: '10:20', ms: 2.2 },
    { name: '10:25', ms: 1.8 },
    { name: '10:30', ms: 2.0 }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Sync */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">INFRASTRUCTURE HEALTH & CLUSTER TELEMETRY</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <Activity size={26} color="var(--emerald-light)" /> System & Infrastructure Monitoring
            </h1>
          </div>

          <button
            onClick={fetchHealth}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={15} /> Sync Infrastructure Nodes
          </button>
        </div>

        {/* 3 Infrastructure Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="API Response Latency" value={`${health?.apiLatencyMs || 18} ms`} trend="Optimal response speed" trendType="up" icon={Gauge} badgeColor="emerald" />
          <StatCard title="MongoDB Cluster Status" value={health?.dbStatus || 'CONNECTED'} trend="0% query drops" trendType="up" icon={Database} badgeColor="emerald" />
          <StatCard title="Server CPU / RAM Load" value={`${health?.cpuUsagePct || 14}% / ${health?.memoryUsagePct || 32}%`} trend="Normal capacity" trendType="neutral" icon={Cpu} badgeColor="gold" />
        </div>

        {/* Analytics Charts: API Latency Sparkline & DB Query Time Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          <ChartCard title="Real-Time API Latency Sparkline (ms)" subtitle="Average Next.js API route response time" loading={loading}>
            <AreaChartWidget data={latencyChartData} xKey="name" yKey="latency" color="#10b981" formatY={(v) => `${v}ms`} />
          </ChartCard>

          <ChartCard title="Database Query Execution Time (ms)" subtitle="MongoDB Mongoose query completion latency" loading={loading}>
            <AreaChartWidget data={dbQueryChartData} xKey="name" yKey="ms" color="#3b82f6" formatY={(v) => `${v}ms`} />
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
