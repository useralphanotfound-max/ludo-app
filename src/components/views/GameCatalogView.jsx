import React, { useState, useEffect } from 'react';
import { Gamepad2, Search, RefreshCw, Trophy, Users, AlertTriangle, Clock, CheckCircle, Activity, CircleSlash, Eye, X } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function GameCatalogView({ permissions = {} }) {
  if (!hasPermission(permissions, 'games.view')) {
    return <AccessDeniedState module="Games" permission="games.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
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
      }
    } catch (e) {
      console.error('Fetch matches error:', e);
    } finally {
      setLoading(false);
    }
  };

  const miniStats = [
    { label: 'Live matches', value: `${matches.filter(m => (m.status || '').toLowerCase() === 'playing').length || 0}`, icon: <Activity size={15} />, color: '#60a5fa', trend: 'Real-time', trendColor: '#60a5fa' },
    { label: 'Completed', value: `${matches.filter(m => (m.status || '').toLowerCase() === 'completed').length || 0}`, icon: <CheckCircle size={15} />, color: '#34d399', trend: 'Closed', trendColor: '#34d399' },
    { label: 'Disputed', value: `${matches.filter(m => (m.status || '').toLowerCase() === 'disputed').length || 0}`, icon: <AlertTriangle size={15} />, color: '#fbbf24', trend: 'Under review', trendColor: '#fbbf24' },
    { label: 'Cancelled', value: `${matches.filter(m => (m.status || '').toLowerCase() === 'cancelled').length || 0}`, icon: <CircleSlash size={15} />, color: '#f87171', trend: 'Action needed', trendColor: '#f87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="GAMING OPERATIONS"
        title="Game catalog console"
        subtitle="Operational visibility into all live, completed, cancelled, and disputed matches across the platform."
        stats={miniStats}
        actions={[
          { label: 'Sync catalog', onClick: fetchMatches, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Filter Bar */}
      <div style={{ backgroundColor: '#121727', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {['ALL', 'Open', 'Playing', 'Completed', 'Cancelled', 'Disputed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: statusFilter === st ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: statusFilter === st ? '#10b981' : '#94a3b8',
                fontWeight: statusFilter === st ? 800 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ width: '260px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="custom-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div style={{ backgroundColor: '#121727', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#171e30', color: '#64748b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem' }}>Match Title</th>
              <th style={{ padding: '1rem' }}>Creator</th>
              <th style={{ padding: '1rem' }}>Opponent</th>
              <th style={{ padding: '1rem' }}>Entry Fee</th>
              <th style={{ padding: '1rem' }}>Prize Pool</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
                  Loading Live Games Catalog...
                </td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No match records match the selected filters.
                </td>
              </tr>
            ) : (
              matches.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    {m.gameCode || `Match #${4890 + idx}`}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#60a5fa' }}>
                    {m.creator || m.player1 || 'kingplayer'}
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                    {m.opponent || m.player2 || 'ludomaster'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    ₹{m.entryFeeRs || m.entryFee || 500}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#34d399' }}>
                    ₹{m.prizePoolRs || m.prizePool || 900}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: m.status === 'Completed' || m.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : m.status === 'Playing' || m.status === 'PLAYING' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                      color: m.status === 'Completed' || m.status === 'COMPLETED' ? '#34d399' : m.status === 'Playing' || m.status === 'PLAYING' ? '#60a5fa' : '#facc15'
                    }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => setSelectedMatch(m)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          <div style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Gamepad2 size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    Game Data — {selectedMatch.gameCode || selectedMatch.id || 'Match #471478'}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Created: {new Date(selectedMatch.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedMatch(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#1e293b', padding: '1rem', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>{selectedMatch.status}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Entry Fee</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>₹{selectedMatch.entryFeeRs || selectedMatch.entryFee || 100}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Prize Pool</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>₹{selectedMatch.prizePoolRs || selectedMatch.prizePool || 180}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>Creator / Player 1</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{selectedMatch.creator || selectedMatch.player1 || 'kingplayer'}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.08)', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 800 }}>Opponent / Player 2</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{selectedMatch.opponent || selectedMatch.player2 || 'ludomaster'}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Game Mode:</span>
                <span style={{ color: '#ffffff', fontWeight: 800 }}>{selectedMatch.gameMode || 'CLASSIC (2 Players)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Winner:</span>
                <span style={{ color: '#34d399', fontWeight: 800 }}>{selectedMatch.winner || 'N/A'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedMatch(null)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', backgroundColor: '#10b981', color: '#000000', fontWeight: 900, border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
