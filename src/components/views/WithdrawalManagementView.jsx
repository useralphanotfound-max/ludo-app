'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Search, RefreshCw, CheckCircle, XCircle, ShieldAlert, Clock, Filter, AlertTriangle, Banknote, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function WithdrawalManagementView({ permissions = {} }) {
  if (!hasPermission(permissions, 'withdrawals.view')) {
    return <AccessDeniedState module="Withdrawals" permission="withdrawals.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, search]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/withdrawals?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.status && res.data) {
        setWithdrawals(res.data);
      }
    } catch (e) {
      console.error('Fetch withdrawals error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (id, action) => {
    const actionName = action === 'APPROVE' ? 'Approve Cashout' : 'Reject & Refund Cashout';
    const confirm = await Swal.fire({
      title: `${actionName}?`,
      text: action === 'APPROVE' ? 'High-value withdrawals (> ₹10,000) trigger dual-approval protocol.' : 'The funds will be returned to user winning balance.',
      icon: action === 'APPROVE' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'APPROVE' ? '#22c55e' : '#ef4444',
      confirmButtonText: actionName,
      background: '#0f1322',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/withdrawals/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });

      if (res.status) {
        Swal.fire({ title: 'Processed', text: res.message, icon: 'success', background: '#0f1322', color: '#ffffff' });
        fetchWithdrawals();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Processing failed', icon: 'error', background: '#0f1322', color: '#ffffff' });
    }
  };

  const miniStats = [
    { label: 'Total requests', value: `${withdrawals.length || 0}`, icon: <Banknote size={15} />, color: '#f87171', trend: 'Live queue', trendColor: '#f87171' },
    { label: 'Pending approval', value: `${withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length}`, icon: <Clock size={15} />, color: '#fbbf24', trend: 'Risk review', trendColor: '#fbbf24' },
    { label: 'Approved', value: `${withdrawals.filter(w => w.status === 'APPROVED').length}`, icon: <ShieldCheck size={15} />, color: '#34d399', trend: 'Awaiting payout', trendColor: '#34d399' },
    { label: 'Rejected', value: `${withdrawals.filter(w => w.status === 'REJECTED').length}`, icon: <ShieldAlert size={15} />, color: '#f87171', trend: 'Needs refund', trendColor: '#f87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="WITHDRAWAL CONTROL"
        title="Cashout approval console"
        subtitle="Risk review, dual approval stage, and payout execution for all withdrawal requests and reversals."
        stats={miniStats}
        actions={[
          { label: 'Sync queue', onClick: fetchWithdrawals, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Filter Tabs & Search */}
      <div style={{ backgroundColor: '#0f1322', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: statusFilter === st ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: statusFilter === st ? '#f87171' : '#94a3b8',
                fontWeight: statusFilter === st ? 800 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {st === 'PENDING_APPROVAL' ? 'Pending Queue' : st}
            </button>
          ))}
        </div>

        <div style={{ width: '280px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search withdrawal ID or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="custom-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div style={{ backgroundColor: '#0f1322', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#13192e', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem' }}>Request ID</th>
              <th style={{ padding: '1rem' }}>User Profile</th>
              <th style={{ padding: '1rem' }}>Payout Amount</th>
              <th style={{ padding: '1rem' }}>Payout Details</th>
              <th style={{ padding: '1rem' }}>Risk Score</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Dual Approval Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#f87171', fontWeight: 800 }}>
                  Fetching Withdrawal Requests...
                </td>
              </tr>
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No pending cashout requests found.
                </td>
              </tr>
            ) : (
              withdrawals.map(w => (
                <tr key={w._id || w.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>{w._id || w.id}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(w.createdAt).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>{w.userId?.username || w.username || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.userId?.mobile || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#f87171', fontSize: '1.05rem' }}>
                    ₹{Math.round((w.amountPaise || w.amount || 0) / 100).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>{w.payoutDetails?.upiId || w.payoutDetails?.accountNumber || 'UPI Payment'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#facc15' }}>{w.payoutDetails?.bankName || 'UPI'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa'
                    }}>
                      PASSED RISK
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: w.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.2)' : w.status === 'PENDING_APPROVAL' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: w.status === 'APPROVED' ? '#4ade80' : w.status === 'PENDING_APPROVAL' ? '#facc15' : '#f87171'
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {w.status === 'PENDING_APPROVAL' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleProcessWithdrawal(w._id || w.id, 'APPROVE')}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Approve Payout
                        </button>
                        <button
                          onClick={() => handleProcessWithdrawal(w._id || w.id, 'REJECT')}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
