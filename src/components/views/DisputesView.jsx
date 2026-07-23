'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Award, RefreshCw, X, ZoomIn, Check, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { showSuccess, showError, confirmAction } from '@/lib/swal';
import LudoLoader from '@/components/common/LudoLoader';

export default function DisputesView() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/disputes');
      if (res.status) {
        setDisputes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (decision) => {
    if (!selectedDispute) return;

    let decisionLabel = 'Declare Winner';
    if (decision === 'P1_WIN') decisionLabel = `Declare Winner: ${selectedDispute.player1?.username}`;
    if (decision === 'P2_WIN') decisionLabel = `Declare Winner: ${selectedDispute.player2?.username}`;
    if (decision === 'REFUND') decisionLabel = 'Refund Match Entry Fees';

    const confirmed = await confirmAction(
      'Confirm Dispute Resolution?',
      `Are you sure you want to proceed with: "${decisionLabel}"?`,
      'Yes, Resolve Dispute'
    );

    if (!confirmed) return;

    setActionLoading(true);

    try {
      const res = await apiFetch(`/admin/disputes/${selectedDispute._id}/resolve`, 'POST', {
        decision,
        adminNotes: adminNotes.trim() || 'Admin screenshot verification verdict'
      });

      if (res.status) {
        await showSuccess('Dispute Resolved!', res.message);
        setSelectedDispute(null);
        setAdminNotes('');
        fetchDisputes();
      }
    } catch (err) {
      showError('Resolution Failed', err.message || 'Failed to resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            Match Screenshot Dispute Console
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Side-by-side Ludo King screenshot inspector. Declare winner or refund match entry fees.
          </p>
        </div>

        <button onClick={fetchDisputes} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={16} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <LudoLoader text="Fetching Active Match Disputes & Screenshots..." />
          </div>
        ) : disputes.length === 0 ? (
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', color: '#34d399' }}>
            <Award size={44} style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>No Pending Match Disputes</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>All submitted match screenshots have been reviewed.</p>
          </div>
        ) : disputes.map(d => (
          <div key={d._id} className="glass-panel card-hover" style={{ borderRadius: '20px', padding: '1.5rem', border: d.status === 'PENDING_ADMIN_REVIEW' ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.04em' }}>MATCH DISPUTE #{d._id.substring(d._id.length - 6)}</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0 0 0' }}>
                  {d.player1?.username} vs {d.player2?.username}
                </h3>
              </div>
              <span className={d.status === 'PENDING_ADMIN_REVIEW' ? 'badge-gold' : 'badge-emerald'}>
                {d.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{d.player1?.username}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>Claims: {d.player1?.claimedResult}</div>
                {d.player1?.screenshotUrl && (
                  <div style={{ position: 'relative', height: '90px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setZoomImage(d.player1.screenshotUrl)}>
                    <img src={d.player1.screenshotUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomIn size={18} color="#ffffff" /></div>
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{d.player2?.username}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>Claims: {d.player2?.claimedResult}</div>
                {d.player2?.screenshotUrl && (
                  <div style={{ position: 'relative', height: '90px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setZoomImage(d.player2.screenshotUrl)}>
                    <img src={d.player2.screenshotUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomIn size={18} color="#ffffff" /></div>
                  </div>
                )}
              </div>
            </div>

            {d.status === 'PENDING_ADMIN_REVIEW' ? (
              <button onClick={() => setSelectedDispute(d)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', fontSize: '0.875rem' }}>
                <ShieldAlert size={16} />
                <span>Open Resolution Console</span>
              </button>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                {d.adminNotes || 'Resolved by superadmin'}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedDispute && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="animate-modal" style={{ width: '100%', maxWidth: '720px', backgroundColor: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '24px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Resolve Dispute #{selectedDispute._id.substring(selectedDispute._id.length - 6)}
              </h3>
              <button onClick={() => setSelectedDispute(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#0b0f19', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <img src={selectedDispute.player1?.screenshotUrl} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                <button onClick={() => handleResolve('P1_WIN')} disabled={actionLoading} className="btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
                  Award Winner: {selectedDispute.player1?.username}
                </button>
              </div>

              <div style={{ backgroundColor: '#0b0f19', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <img src={selectedDispute.player2?.screenshotUrl} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                <button onClick={() => handleResolve('P2_WIN')} disabled={actionLoading} className="btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
                  Award Winner: {selectedDispute.player2?.username}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Admin Verdict Notes</label>
              <input type="text" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="e.g. Player 1 submitted valid winning screen with tokens in home zone." className="custom-input" style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
              <button onClick={() => handleResolve('REFUND')} disabled={actionLoading} className="btn-secondary" style={{ color: '#f87171' }}>
                Cancel Match & Refund Both
              </button>
              <button onClick={() => setSelectedDispute(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Screenshot Zoom" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '12px' }} />
        </div>
      )}
    </div>
  );
}
