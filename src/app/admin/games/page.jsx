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
import { Gamepad2, Activity, CheckCircle, AlertTriangle, CircleSlash, RefreshCw, Eye, X, Trophy, Shield, Clock, Award } from 'lucide-react';

export default function GameCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [summaryStats, setSummaryStats] = useState(null);
  const [tierData, setTierData] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

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
          <strong style={{ color: 'var(--emerald-light)' }}>{r.player1 || r.creator || 'kingplayer'}</strong> vs <strong style={{ color: 'var(--rose)' }}>{r.player2 || r.opponent || 'ludomaster'}</strong>
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
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, r) => (
        <button
          onClick={() => setSelectedMatch(r)}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--emerald-light)',
            fontWeight: 800,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Eye size={14} /> View Data
        </button>
      )
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

        {/* Game View Data Modal */}
        {selectedMatch && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '620px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Gamepad2 size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      Game Data — Match #{selectedMatch.gameCode || selectedMatch.id || '471478'}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Created At: {new Date(selectedMatch.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMatch(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status & Overview Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#1e293b', padding: '1rem', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Match Status</div>
                  <div style={{ marginTop: '4px' }}>
                    <StatusBadge status={selectedMatch.status || 'COMPLETED'} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Entry Fee</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>₹{selectedMatch.entryFeeRs || selectedMatch.entryFee || 100}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Prize Pool</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399' }}>₹{selectedMatch.prizePoolRs || selectedMatch.prizePool || 180}</div>
                </div>
              </div>

              {/* Players Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>Player 1 (Creator)</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {selectedMatch.player1 || selectedMatch.creator || 'kingplayer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Role: Room Host</div>
                </div>

                <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 800, textTransform: 'uppercase' }}>Player 2 (Opponent)</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {selectedMatch.player2 || selectedMatch.opponent || 'ludomaster'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Role: Challenger</div>
                </div>
              </div>

              {/* Additional Match Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', backgroundColor: '#1e293b', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Game Mode</span>
                  <span style={{ fontWeight: 800, color: '#ffffff' }}>{selectedMatch.gameMode || 'CLASSIC (2 Players)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Room Code</span>
                  <span style={{ fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{selectedMatch.roomCode || 'LUDO-78492'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Winner Declaration</span>
                  <span style={{ fontWeight: 800, color: selectedMatch.winner ? '#34d399' : '#fbbf24' }}>
                    {selectedMatch.winner || (selectedMatch.status === 'COMPLETED' ? (selectedMatch.player1 || 'kingplayer') : 'Game In Progress')}
                  </span>
                </div>
                {selectedMatch.screenshotUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <span style={{ color: '#94a3b8' }}>Result Evidence Screenshot:</span>
                    <a href={selectedMatch.screenshotUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                      View Submitted Screenshot
                    </a>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedMatch(null)}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '10px',
                    backgroundColor: '#10b981',
                    color: '#000000',
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Close Game Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
