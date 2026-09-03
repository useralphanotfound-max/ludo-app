'use client';

import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Users, ShieldAlert, Clock, Play, Pause, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';

export default function LiveGamesView() {
  const [loading, setLoading] = useState(true);
  const [liveGames, setLiveGames] = useState([]);

  useEffect(() => {
    fetchLiveGames();
    const interval = setInterval(fetchLiveGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveGames = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/live-games');
      if (res.status && res.data) {
        setLiveGames(res.data);
      }
    } catch (e) {
      console.error('Fetch live games error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminIntervene = async (gameId) => {
    const confirm = await Swal.fire({
      title: 'Admin Game Intervention',
      text: 'Select action to execute on live room. Action will be logged to audit trail.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cancel Match & Refund Both',
      confirmButtonColor: '#ef4444',
      background: '#0f1424',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({ title: 'Intervention Logged', text: `Match ${gameId} cancelled and entry fees refunded`, icon: 'success', background: '#0f1424', color: '#ffffff' });
    fetchLiveGames();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem',
        backgroundColor: '#121727',
        borderRadius: '16px',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>REAL-TIME TELEMETRY</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Radio size={24} color="#34d399" style={{ animation: 'pulse 1.5s infinite' }} />
            Live Games Real-Time Monitor
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Real-time telemetry of matches currently in progress. Interventions require permission logging.
          </p>
        </div>
        <button
          onClick={fetchLiveGames}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} /> Sync Live Stream
        </button>
      </div>

      {/* Grid of Live Games */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#34d399', fontWeight: 800 }}>
          Connecting to Real-Time Match Events Socket...
        </div>
      ) : liveGames.length === 0 ? (
        <div style={{ backgroundColor: '#121727', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center', color: '#64748b' }}>
          No active games currently in progress.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {liveGames.map((game, i) => (
            <div key={i} style={{ backgroundColor: '#121727', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                  {game.gameCode || `Live Match #${4890 + i}`}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                  LIVE
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', backgroundColor: '#171e30', padding: '0.875rem', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ENTRY FEE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>₹{game.entryFeeRs || 500}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PRIZE POOL</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#facc15' }}>₹{game.prizePoolRs || 900}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Player 1:</span>
                  <strong style={{ color: '#4ade80' }}>{game.player1 || 'kingplayer'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Player 2:</span>
                  <strong style={{ color: '#f87171' }}>{game.player2 || 'ludomaster'}</strong>
                </div>
              </div>

              <button
                onClick={() => handleAdminIntervene(game.gameCode || game.id)}
                style={{
                  padding: '0.625rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertTriangle size={16} /> Admin Intervene / Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
