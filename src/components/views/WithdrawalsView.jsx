'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { showSuccess, showError, confirmAction, promptReason } from '@/lib/swal';
import LudoLoader from '@/components/common/LudoLoader';

export default function WithdrawalsView() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('PENDING_APPROVAL');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/withdrawals?status=${filter}`);
      if (res.status) {
        setWithdrawals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (w, action) => {
    let reason = '';
    if (action === 'APPROVE') {
      const confirmed = await confirmAction(
        'Approve Cashout?',
        `Confirm payout of ₹${w.amountRs} to ${w.username} (${w.payoutMethod})?`,
        'Yes, Approve Payout'
      );
      if (!confirmed) return;
    } else {
      reason = await promptReason(
        `Reject Cashout for ${w.username}?`,
        'Enter rejection reason note for user refund...'
      );
      if (!reason) return;
    }

    setProcessingId(w.id);
    try {
      const res = await apiFetch(`/admin/withdrawals/${w.id}/process`, 'POST', { action, reason });
      if (res.status) {
        await showSuccess('Cashout Processed!', res.message);
        fetchWithdrawals();
      }
    } catch (err) {
      showError('Processing Failed', err.message || 'Cashout processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            Cashout Withdrawal Queue
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Process 100% net user cashout requests (No TDS, No PAN/KYC required).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#0f172a', padding: '0.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map(statusKey => (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === statusKey ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: filter === statusKey ? '#818cf8' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {statusKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#818cf8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>User / Mobile</th>
              <th style={{ padding: '1rem 1.25rem' }}>Cashout Amount</th>
              <th style={{ padding: '1rem 1.25rem' }}>Payout Method & Details</th>
              <th style={{ padding: '1rem 1.25rem' }}>Requested At</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem' }}>
                  <LudoLoader text="Loading Cashout Withdrawal Queue..." />
                </td>
              </tr>
            ) : withdrawals.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No withdrawal requests found for {filter}.</td></tr>
            ) : withdrawals.map(w => (
              <tr key={w.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff' }}>{w.username}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.mobile}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '1.125rem', fontWeight: 900, color: '#34d399' }}>
                  ₹{w.amountRs}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ color: '#cbd5e1', fontWeight: 700 }}>{w.payoutMethod}</div>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                    {w.accountDetails?.upiId || `${w.accountDetails?.accountNumber} (${w.accountDetails?.ifscCode})`}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                  {new Date(w.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={w.status === 'APPROVED' ? 'badge-emerald' : w.status === 'REJECTED' ? 'badge-rose' : 'badge-gold'}>
                    {w.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  {w.status === 'PENDING_APPROVAL' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleProcess(w, 'APPROVE')}
                        disabled={processingId === w.id}
                        className="btn-success"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {processingId === w.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Approve Payout</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleProcess(w, 'REJECT')}
                        disabled={processingId === w.id}
                        className="btn-danger"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <XCircle size={14} />
                        <span>Reject & Refund</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
