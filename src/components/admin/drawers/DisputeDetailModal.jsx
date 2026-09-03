'use client';

import React, { useState } from 'react';
import { X, ZoomIn, Swords, Trophy, AlertTriangle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import StatusBadge from '../tables/StatusBadge';

export default function DisputeDetailModal({ dispute, onClose, onResolve }) {
  const [zoomImage, setZoomImage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  if (!dispute) return null;

  const handleAward = async (action, winnerUsername) => {
    const confirm = await Swal.fire({
      title: `${action === 'CANCEL' ? 'Cancel Match & Refund Both?' : `Award Win to ${winnerUsername}?`}`,
      text: `Action will resolve Dispute ${dispute._id || dispute.id} and disburse funds immediately.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'CANCEL' ? 'var(--rose)' : 'var(--emerald)',
      confirmButtonText: 'Confirm Resolution',
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      if (onResolve) {
        await onResolve(dispute._id || dispute.id, action, winnerUsername, adminNotes);
      }
      Swal.fire({ title: 'Dispute Resolved', text: `Match resolved successfully.`, icon: 'success', background: '#111624', color: '#ffffff' });
      onClose();
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Failed to resolve dispute', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setActionLoading(false);
    }
  };

  const p1Raw = dispute.player1 || {};
  const p2Raw = dispute.player2 || {};
  const p1 = {
    ...p1Raw,
    username: p1Raw.username || dispute.matchId?.players?.[0]?.username || 'Player 1',
    claimedResult: p1Raw.claimedResult || 'WON',
    deviceIp: p1Raw.deviceIp || '103.22.89.14 (Mumbai, IN)'
  };
  const p2 = {
    ...p2Raw,
    username: p2Raw.username || dispute.matchId?.players?.[1]?.username || 'Player 2',
    claimedResult: p2Raw.claimedResult || 'LOST',
    deviceIp: p2Raw.deviceIp || '157.33.12.90 (Delhi, IN)'
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(7, 9, 19, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <div
          className="glass-panel animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            border: '1.5px solid var(--border)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Dispute Investigation Room — {dispute._id || dispute.id}
                </h3>
                <StatusBadge status={dispute.status || 'PENDING'} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Match ID: <strong style={{ color: 'var(--text-secondary)' }}>{dispute.matchId || 'Match #4892'}</strong> • Entry Fee: <strong style={{ color: 'var(--emerald-light)' }}>₹{dispute.entryFeeRs || 500}</strong> • Prize Pool: <strong style={{ color: 'var(--gold)' }}>₹{dispute.prizePoolRs || 900}</strong>
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>

          {/* Side by Side Player Screenshot Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Player 1 Card */}
            <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--emerald-light)', fontSize: '0.95rem' }}>{p1.username}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-light)' }}>
                  Claimed: {p1.claimedResult}
                </span>
              </div>
              <div
                style={{
                  height: '200px',
                  backgroundColor: 'var(--surface-2)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px dashed var(--border)'
                }}
                onClick={() => setZoomImage(p1.screenshotUrl || '/disputes/p1_win.png')}
              >
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ZoomIn size={24} style={{ marginBottom: '0.35rem' }} />
                  <div style={{ fontSize: '0.78rem' }}>Click to Zoom Victory Screenshot</div>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>IP: {p1.deviceIp}</div>
            </div>

            {/* Player 2 Card */}
            <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--rose)', fontSize: '0.95rem' }}>{p2.username}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose)' }}>
                  Claimed: {p2.claimedResult}
                </span>
              </div>
              <div
                style={{
                  height: '200px',
                  backgroundColor: 'var(--surface-2)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px dashed var(--border)'
                }}
                onClick={() => setZoomImage(p2.screenshotUrl || '/disputes/p2_win.png')}
              >
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ZoomIn size={24} style={{ marginBottom: '0.35rem' }} />
                  <div style={{ fontSize: '0.78rem' }}>Click to Zoom Victory Screenshot</div>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>IP: {p2.deviceIp}</div>
            </div>
          </div>

          {/* Admin Resolution Action Controls */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Admin Adjudication & Mandatory Notes</h4>
            <textarea
              placeholder="State clear resolution rationale for audit log..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="custom-input"
              rows={2}
            />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAward('AWARD_P1', p1.username)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--emerald)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🏆 Award Win to {p1.username} (₹{dispute.prizePoolRs || 900})
              </button>

              <button
                onClick={() => handleAward('AWARD_P2', p2.username)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--emerald)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🏆 Award Win to {p2.username} (₹{dispute.prizePoolRs || 900})
              </button>

              <button
                onClick={() => handleAward('CANCEL', 'Both')}
                disabled={actionLoading}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(244, 63, 94, 0.2)',
                  color: 'var(--rose)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  cursor: 'pointer'
                }}
              >
                Cancel & Refund Both
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setZoomImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div style={{ color: '#ffffff', textAlign: 'center', padding: '2rem', background: '#111624', borderRadius: '12px', border: '1px solid var(--emerald-light)' }}>
              Zoomed Screenshot View ({zoomImage})
            </div>
          </div>
        </div>
      )}
    </>
  );
}
