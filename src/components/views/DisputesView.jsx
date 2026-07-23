import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trophy, RefreshCw, ZoomIn, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function DisputesView() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

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

  const handleResolve = async (id, decision) => {
    const confirmMsg = decision === 'P1_WIN'
      ? `Declare ${selectedDispute.player1.username} as Winner?`
      : decision === 'P2_WIN'
      ? `Declare ${selectedDispute.player2.username} as Winner?`
      : `Refund entry fees to both players?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await apiFetch(`/admin/disputes/${id}/resolve`, 'POST', {
        decision,
        adminNotes
      });

      if (res.status) {
        setActionMessage(`✅ ${res.message}`);
        setTimeout(() => {
          setSelectedDispute(null);
          setAdminNotes('');
          setActionMessage('');
          fetchDisputes();
        }, 1500);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            Match Dispute Verification
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Inspect side-by-side player uploaded screenshots and award match winners or refund entries.
          </p>
        </div>

        <button onClick={fetchDisputes} className="btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Disputes</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading Match Disputes...
        </div>
      ) : disputes.length === 0 ? (
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
          <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
            No Active Match Disputes
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>All match outcomes have been processed cleanly without conflict!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {disputes.map(d => (
            <div key={d._id} className="glass-panel card-hover" style={{ borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge-gold">
                  DISPUTED MATCH
                </span>
                <span className={d.status === 'PENDING_ADMIN_REVIEW' ? 'badge-rose' : 'badge-emerald'}>
                  ● {d.status}
                </span>
              </div>

              {/* Player 1 vs Player 2 comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.875rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.875rem' }}>{d.player1?.username || 'Player 1'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem', fontWeight: 700 }}>Claimed: WON 🏆</div>
                  {d.player1?.screenshotUrl && (
                    <div style={{ position: 'relative', marginTop: '0.625rem' }}>
                      <img
                        src={d.player1.screenshotUrl}
                        alt="Player 1 Claim"
                        onClick={() => setPreviewImage(d.player1.screenshotUrl)}
                        style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <span style={{ position: 'absolute', right: '6px', bottom: '6px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', color: '#38bdf8' }}>Zoom 🔍</span>
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '0.875rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.875rem' }}>{d.player2?.username || 'Player 2'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem', fontWeight: 700 }}>Claimed: WON 🏆</div>
                  {d.player2?.screenshotUrl && (
                    <div style={{ position: 'relative', marginTop: '0.625rem' }}>
                      <img
                        src={d.player2.screenshotUrl}
                        alt="Player 2 Claim"
                        onClick={() => setPreviewImage(d.player2.screenshotUrl)}
                        style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <span style={{ position: 'absolute', right: '6px', bottom: '6px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', color: '#fbbf24' }}>Zoom 🔍</span>
                    </div>
                  )}
                </div>
              </div>

              {d.status === 'PENDING_ADMIN_REVIEW' ? (
                <button
                  onClick={() => setSelectedDispute(d)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Trophy size={18} /> Review Evidence & Award Winner
                </button>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', backgroundColor: '#090d16', padding: '0.625rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Resolved by {d.resolvedByAdminUsername || 'Superadmin'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-modal" style={{
            borderRadius: '20px',
            padding: '2rem',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                ⚖️ Resolve Dispute: Screenshot Verification
              </h3>
              <button onClick={() => setSelectedDispute(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1.25rem 0' }}>
              Examine both player screenshots carefully below. Click any screenshot to view full resolution.
            </p>

            {actionMessage && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#090d16', fontSize: '0.875rem', marginBottom: '1.25rem', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                {actionMessage}
              </div>
            )}

            {/* Split Comparison Viewer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8', fontWeight: 800 }}>
                  {selectedDispute.player1.username}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.625rem', fontWeight: 700 }}>Claim: WON 🏆</div>
                <img
                  src={selectedDispute.player1.screenshotUrl}
                  alt="Player 1"
                  style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', border: '2px solid #38bdf8' }}
                  onClick={() => setPreviewImage(selectedDispute.player1.screenshotUrl)}
                />
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fbbf24', fontWeight: 800 }}>
                  {selectedDispute.player2.username}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.625rem', fontWeight: 700 }}>Claim: WON 🏆</div>
                <img
                  src={selectedDispute.player2.screenshotUrl}
                  alt="Player 2"
                  style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', border: '2px solid #fbbf24' }}
                  onClick={() => setPreviewImage(selectedDispute.player2.screenshotUrl)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Admin Justification & Audit Notes
              </label>
              <textarea
                rows={2}
                placeholder="Reasoning for winner declaration..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="custom-input"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedDispute(null)} className="btn-secondary">
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleResolve(selectedDispute._id, 'REFUND_BOTH')}
                style={{ backgroundColor: '#334155', color: '#ffffff', border: 'none', padding: '0.625rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Refund Both Players
              </button>

              <button
                type="button"
                onClick={() => handleResolve(selectedDispute._id, 'P1_WIN')}
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '0.625rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Award {selectedDispute.player1.username}
              </button>

              <button
                type="button"
                onClick={() => handleResolve(selectedDispute._id, 'P2_WIN')}
                style={{ backgroundColor: '#d97706', color: '#ffffff', border: 'none', padding: '0.625rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Award {selectedDispute.player2.username}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            padding: '1.5rem'
          }}
        >
          <img src={previewImage} alt="Full Screen Zoom Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '16px', border: '2px solid #f59e0b', boxShadow: '0 0 50px rgba(245, 158, 11, 0.4)' }} />
        </div>
      )}
    </div>
  );
}
