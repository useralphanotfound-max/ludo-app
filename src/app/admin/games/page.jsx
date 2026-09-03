'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import LineChartWidget from '@/components/admin/charts/AreaChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SearchBar from '@/components/admin/forms/SearchBar';
import FilterGroup from '@/components/admin/forms/FilterGroup';
import { apiFetch } from '@/services/api';
import { Gamepad2, Activity, CheckCircle, AlertTriangle, CircleSlash, RefreshCw } from 'lucide-react';

export default function GameCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [summaryStats, setSummaryStats] = useState(null);
  const [tierData, setTierData] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, [statusFilter, search]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/games?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.status && res.data) {
        setMatches(res.data);
        if (res.summaryStats) setSummaryStats(res.summaryStats);
        if (res.entryFeeTierData) setTierData(res.entryFeeTierData);
      }
    } catch (e) {
      console.error('Fetch matches error:', e);
    } finally {
      setLoading(false);
    }
  };

  const entryFeeTierData = tierData.length > 0 ? tierData : [
    { name: '₹50 Tier', rooms: matches.length }
  ];

  const columns = [
    {
      key: 'gameCode',
      label: 'Match ID',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>{v || r.id || 'Match #4892'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'players',
      label: 'Players',
      render: (_, r) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--emerald-light)' }}>{r.player1 || 'kingplayer'}</strong> vs <strong style={{ color: 'var(--rose)' }}>{r.player2 || 'ludomaster'}</strong>
        </span>
      )
    },
    {
      key: 'entryFeeRs',
      label: 'Entry Fee',
      render: (v) => <strong style={{ color: '#ffffff' }}>₹{(v || 500).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'prizePoolRs',
      label: 'Prize Pool',
      render: (v) => <strong style={{ color: 'var(--gold)' }}>₹{(v || 900).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v || 'COMPLETED'} />
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Sync */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">GAMES & MATCH HISTORY</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Game List & Match Records
            </h1>
          </div>

          <button
            onClick={fetchMatches}
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
            <RefreshCw size={15} /> Refresh List
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Active Games Playing" value={summaryStats?.liveCount !== undefined ? summaryStats.liveCount : matches.filter(m => (m.status || '').toLowerCase() === 'playing').length} trend="Real-time" trendType="up" icon={Activity} badgeColor="emerald" />
          <StatCard title="Completed Matches" value={summaryStats?.completedCount !== undefined ? summaryStats.completedCount : matches.filter(m => (m.status || '').toLowerCase() === 'completed').length} trend="Finished games" trendType="up" icon={CheckCircle} badgeColor="emerald" />
          <StatCard title="Conflicting Matches" value={summaryStats?.disputedCount !== undefined ? summaryStats.disputedCount : matches.filter(m => (m.status || '').toLowerCase() === 'disputed').length} trend="Needs review" trendType="down" icon={AlertTriangle} badgeColor="gold" />
          <StatCard title="Cancelled Rooms" value={summaryStats?.cancelledCount !== undefined ? summaryStats.cancelledCount : matches.filter(m => (m.status || '').toLowerCase() === 'cancelled').length} trend="Money refunded" trendType="neutral" icon={CircleSlash} badgeColor="rose" />
        </div>

        {/* Analytics: Entry Fee Tier Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <ChartCard title="Matches List by Entry Fee Amount" subtitle="Popular entry fee tiers chosen by players" loading={loading}>
            <BarChartWidget data={entryFeeTierData} xKey="name" bars={[{ key: 'rooms', color: '#10b981', name: 'Match Rooms' }]} />
          </ChartCard>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by Match ID, Game Code, or Username..." />

          <FilterGroup
            options={[
              { label: 'All Matches', value: 'ALL' },
              { label: 'Playing Only', value: 'Playing' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Disputed', value: 'Disputed' },
              { label: 'Cancelled', value: 'Cancelled' }
            ]}
            activeValue={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={matches}
          loading={loading}
          emptyTitle="No Game Matches Found"
          emptyDescription="No match records found matching current status filter."
        />
      </div>
    </AppShell>
  );
}
