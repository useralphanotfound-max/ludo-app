import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle, XCircle, Clock, ShieldCheck, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function WithdrawalsView() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/withdrawals');
      if (res.status) {
        setWithdrawals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, action) => {
    if (action === 'REJECT' && !rejectionReason) {
      alert('Please provide a reason for rejecting the cashout request.');
      return;
    }

    const confirmMsg = action === 'APPROVE'
      ? `Approve cashout of ₹${selectedRequest.amountRs} for ${selectedRequest.username}?`
      : `Reject cashout of ₹${selectedRequest.amountRs} for ${selectedRequest.username}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await apiFetch(`/admin/withdrawals/${id}/process`, 'POST', {
        action,
        reason: rejectionReason
      });

      if (res.status) {
        setActionMessage(`✅ ${res.message}`);
        setTimeout(() => {
          setSelectedRequest(null);
          setRejectionReason('');
          setActionMessage('');
          fetchWithdrawals();
        }, 1200);
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
            Cashout & Withdrawal Queue
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Process pending user cashout requests with 100% net payout (**No TDS Deductions**).
          </p>
        </div>

        <button onClick={fetchWithdrawals} className="btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#090d16', color: '#64748b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>User Info</th>
              <th style={{ padding: '1rem 1.25rem' }}>Requested Amount</th>
              <th style={{ padding: '1rem 1.25rem' }}>Payout Method & Details</th>
              <th style={{ padding: '1rem 1.25rem' }}>Risk Score</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Loading Cashout Queue...
                </td>
              </tr>
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No withdrawal requests found.
                </td>
              </tr>
            ) : (
              withdrawals.map(w => (
                <tr key={w.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>{w.username}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mobile: {w.mobile}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>
                      ₹{w.amountRs}
                    </div>
                    <span className="badge-emerald" style={{ fontSize: '0.65rem', marginTop: '2px' }}>100% Net Payout</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{w.payoutMethod}</div>
                    {w.payoutMethod === 'UPI' ? (
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>UPI: {w.accountDetails?.upiId || 'N/A'}</div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                        Acc: {w.accountDetails?.accountNumber} | IFSC: {w.accountDetails?.ifscCode}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={w.riskScore === 'HIGH' ? 'badge-rose' : 'badge-emerald'}>
                      ● {w.riskScore} RISK
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={w.status === 'APPROVED' ? 'badge-emerald' : w.status === 'REJECTED' ? 'badge-rose' : 'badge-gold'}>
                      ● {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    {w.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => setSelectedRequest(w)}
                        className="btn-primary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Review & Process
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Process Modal */}
      {selectedRequest && (
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
            maxWidth: '480px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Review Cashout: {selectedRequest.username}
              </h3>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', marginBottom: '0.25rem' }}>
                ₹{selectedRequest.amountRs} (100% Net Payout)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                Method: <strong>{selectedRequest.payoutMethod}</strong>
              </div>
              {selectedRequest.payoutMethod === 'UPI' ? (
                <div style={{ fontSize: '0.875rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                  UPI ID: {selectedRequest.accountDetails?.upiId}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                  Acc: {selectedRequest.accountDetails?.accountNumber} ({selectedRequest.accountDetails?.ifscCode})
                </div>
              )}
            </div>

            {actionMessage && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#090d16', fontSize: '0.875rem', marginBottom: '1.25rem', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                {actionMessage}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Rejection Reason (Required if rejecting)
              </label>
              <input
                type="text"
                placeholder="e.g. Invalid UPI ID / Account mismatch"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="custom-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedRequest(null)} className="btn-secondary">
                Close
              </button>

              <button onClick={() => handleProcess(selectedRequest.id, 'REJECT')} className="btn-danger">
                Reject & Refund
              </button>

              <button onClick={() => handleProcess(selectedRequest.id, 'APPROVE')} className="btn-success">
                Approve Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
