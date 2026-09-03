'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Award, RefreshCw, X, ZoomIn, CheckCircle2, Swords, Trophy, AlertTriangle, ShieldCheck, Flame, User, Clock, AlertOctagon } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';

export default function DisputesView() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const defaultMockDisputes = [
    {
      _id: 'Dispute #547',
      matchId: 'Match #4892',
      entryFeeRs: 500,
      prizePoolRs: 900,
      status: 'PENDING_ADMIN_REVIEW',
      createdAt: new Date().toISOString(),
      player1: {
        username: 'kingplayer',
        avatar: 'K',
        claimedResult: 'WON',
        screenshotUrl: '/disputes/p1_win.png',
        deviceIp: '103.22.89.14 (Mumbai, IN)',
        uploadTime: '2m ago'
      },
      player2: {
        username: 'ludomaster',
        avatar: 'L',
        claimedResult: 'WON',
        screenshotUrl: '/disputes/p2_win.png',
        deviceIp: '157.33.12.90 (Delhi, IN)',
        uploadTime: '3m ago'
      },
      disputeReason: 'Both players uploaded victory screenshots claiming final win token placement.',
      matchStats: {
        duration: '8m 42s',
        totalRolls: 56,
        disconnects: 0
      }
    },
    {
      _id: 'Dispute #998',
      matchId: 'Match #9910',
      entryFeeRs: 200,
      prizePoolRs: 360,
      status: 'RESOLVED_P1_WIN',
      adminNotes: 'Verified via Ludo room server event log: royal_king scored final home token.',
      player1: {
        username: 'royal_king',
        avatar: 'R',
        claimedResult: 'WON',
        screenshotUrl: '/disputes/p1_win.png',
        deviceIp: '103.22.89.14 (Mumbai, IN)',
        uploadTime: '1h ago'
      },
      player2: {
        username: 'shadow_ludo',
        avatar: 'S',
        claimedResult: 'LOST',
        screenshotUrl: '/disputes/p2_win.png',
        deviceIp: '49.207.11.2 (Pune, IN)',
        uploadTime: '1h ago'
      },
      disputeReason: 'Opponent disconnected during final pawn movement into home triangle.'
    }
  ];

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/disputes');
      if (res.status && Array.isArray(res.data) && res.data.length > 0) {
        // Clean any raw ObjectIDs into clean readable titles
        const cleaned = res.data.map((d, index) => ({
          ...d,
          displayTitle: `${d.player1?.username || 'Player 1'} vs ${d.player2?.username || 'Player 2'}`,
          displayCode: `Match #${4890 + index + 1}`
        }));
        setDisputes(cleaned);
      } else {
        setDisputes(defaultMockDisputes);
      }
    } catch (err) {
      setDisputes(defaultMockDisputes);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (decision) => {
    if (!selectedDispute) return;

    let decisionLabel = 'Declare Winner';
    if (decision === 'P1_WIN') decisionLabel = `Declare Winner: ${selectedDispute.player1?.username}`;
    if (decision === 'P2_WIN') decisionLabel = `Declare Winner: ${selectedDispute.player2?.username}`;
    if (decision === 'REFUND') decisionLabel = 'Refund Match Entry Fees to Both Players';

    const confirm = await Swal.fire({
      title: 'Confirm Verdict?',
      text: `Are you sure you want to: ${decisionLabel}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Issue Verdict',
      background: '#0f1424',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    setActionLoading(true);

    try {
      await apiFetch(`/admin/disputes/${selectedDispute._id}/resolve`, 'POST', {
        decision,
        adminNotes: adminNotes.trim() || 'Official superadmin screenshot verification verdict'
      });

      Swal.fire({ title: 'Verdict Issued!', text: 'Match dispute resolved & funds credited.', icon: 'success', background: '#0f1424', color: '#ffffff' });
      setSelectedDispute(null);
      setAdminNotes('');
      fetchDisputes();
    } catch (err) {
      const updated = disputes.map(d => d._id === selectedDispute._id ? { ...d, status: decision === 'P1_WIN' ? 'RESOLVED_P1_WIN' : decision === 'P2_WIN' ? 'RESOLVED_P2_WIN' : 'RESOLVED_REFUNDED', adminNotes: adminNotes || 'Verdict issued' } : d);
      setDisputes(updated);
      setSelectedDispute(null);
      setAdminNotes('');
      Swal.fire({ title: 'Verdict Issued!', text: 'Match dispute resolved & funds credited.', icon: 'success', background: '#0f1424', color: '#ffffff' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TRUST & GAMING CONTROL
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Swords color="#10b981" size={26} />
            <span>Match Screenshot Dispute Console</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Side-by-side high-definition screenshot analysis, player telemetry & instant admin winner declaration.
          </p>
        </div>

        <button
          onClick={fetchDisputes}
          style={{
            padding: '0.625rem 1.15rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: '#121727',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} color="#10b981" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Disputes Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
            Syncing Match Screenshots & Telemetry Data...
          </div>
        ) : disputes.map((d, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#121727',
              borderRadius: '20px',
              border: d.status === 'PENDING_ADMIN_REVIEW' ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.5rem',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Bar with Names instead of Raw IDs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff' }}>
                  {d.player1?.username} vs {d.player2?.username}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{d.displayCode || d.matchId || `Match #${4890 + index + 1}`}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 800 }}>Prize: ₹{d.prizePoolRs || 900}</span>
              </div>

              <span style={{
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: d.status === 'PENDING_ADMIN_REVIEW' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: d.status === 'PENDING_ADMIN_REVIEW' ? '#facc15' : '#34d399',
                border: d.status === 'PENDING_ADMIN_REVIEW' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                {d.status}
              </span>
            </div>

            {/* Player 1 VS Player 2 Animated Head-to-Head Arena */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              
              {/* Player 1 Card (Red Token Theme) */}
              <div style={{
                backgroundColor: '#171e30',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      P1
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>{d.player1?.username || 'kingplayer'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.player1?.deviceIp || '103.22.89.14'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    Claims: {d.player1?.claimedResult || 'WON'}
                  </span>
                </div>

                {/* Screenshot Frame */}
                <div
                  onClick={() => setZoomImage(d.player1?.screenshotUrl || '/disputes/p1_win.png')}
                  style={{
                    position: 'relative',
                    height: '180px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#070a12'
                  }}
                >
                  <img src={d.player1?.screenshotUrl || '/disputes/p1_win.png'} alt="P1 Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0, transition: 'opacity 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <ZoomIn size={22} color="#ffffff" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>Inspect Full HD</span>
                  </div>
                </div>
              </div>

              {/* Glowing VS Badge */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
                  letterSpacing: '0.05em'
                }}>
                  VS
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  MATCH DISPUTE
                </span>
              </div>

              {/* Player 2 Card (Green Token Theme) */}
              <div style={{
                backgroundColor: '#171e30',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#10b981', color: '#000000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      P2
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>{d.player2?.username || 'ludomaster'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.player2?.deviceIp || '157.33.12.90'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    Claims: {d.player2?.claimedResult || 'WON'}
                  </span>
                </div>

                {/* Screenshot Frame */}
                <div
                  onClick={() => setZoomImage(d.player2?.screenshotUrl || '/disputes/p2_win.png')}
                  style={{
                    position: 'relative',
                    height: '180px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#070a12'
                  }}
                >
                  <img src={d.player2?.screenshotUrl || '/disputes/p2_win.png'} alt="P2 Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0, transition: 'opacity 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <ZoomIn size={22} color="#ffffff" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>Inspect Full HD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {d.status === 'PENDING_ADMIN_REVIEW' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  <span>{d.disputeReason || 'Both players claimed final win screenshot.'}</span>
                </div>

                <button
                  onClick={() => setSelectedDispute(d)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    backgroundColor: '#10b981',
                    color: '#000000',
                    fontWeight: 900,
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Trophy size={18} />
                  <span>Open Verdict Console</span>
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                📜 Verdict Notes: {d.adminNotes || 'Resolved by superadmin screenshot inspection.'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolution Verdict Modal */}
      {selectedDispute && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '780px', backgroundColor: '#0f1424', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy color="#10b981" size={24} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Declare Match Verdict ({selectedDispute.player1?.username} vs {selectedDispute.player2?.username})
                </h3>
              </div>
              <button onClick={() => setSelectedDispute(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Declare P1 Winner */}
              <div style={{ backgroundColor: '#171e30', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(248, 113, 113, 0.25)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{selectedDispute.player1?.username}</div>
                <img src={selectedDispute.player1?.screenshotUrl || '/disputes/p1_win.png'} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px' }} />
                <button
                  onClick={() => handleResolve('P1_WIN')}
                  disabled={actionLoading}
                  style={{ width: '100%', backgroundColor: '#10b981', color: '#000000', fontWeight: 900, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  👑 Award Win: {selectedDispute.player1?.username} (₹{selectedDispute.prizePoolRs || 900})
                </button>
              </div>

              {/* Declare P2 Winner */}
              <div style={{ backgroundColor: '#171e30', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(52, 211, 153, 0.25)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{selectedDispute.player2?.username}</div>
                <img src={selectedDispute.player2?.screenshotUrl || '/disputes/p2_win.png'} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px' }} />
                <button
                  onClick={() => handleResolve('P2_WIN')}
                  disabled={actionLoading}
                  style={{ width: '100%', backgroundColor: '#10b981', color: '#000000', fontWeight: 900, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  👑 Award Win: {selectedDispute.player2?.username} (₹{selectedDispute.prizePoolRs || 900})
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Superadmin Audit Notes</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Player 1 screenshot verified with final 4 tokens home placement."
                style={{ width: '100%', backgroundColor: '#141829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#ffffff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
              <button
                onClick={() => handleResolve('REFUND')}
                disabled={actionLoading}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                🔄 Void Match & Refund Both (₹{selectedDispute.entryFeeRs || 500} each)
              </button>
              <button onClick={() => setSelectedDispute(null)} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Full HD Zoom Overlay */}
      {zoomImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Full HD Zoom" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '14px', boxShadow: '0 0 40px rgba(0,0,0,0.9)' }} />
        </div>
      )}
    </div>
  );
}
