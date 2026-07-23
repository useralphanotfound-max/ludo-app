'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Wallet, Edit3, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { showSuccess, showError, confirmAction } from '@/lib/swal';
import LudoLoader from '@/components/common/LudoLoader';

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [subBalanceType, setSubBalanceType] = useState('deposit');
  const [actionType, setActionType] = useState('CREDIT');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/users?search=${encodeURIComponent(search)}`);
      if (res.status) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustAmount || parseFloat(adjustAmount) <= 0 || !reason.trim()) {
      showError('Validation Error', 'Valid amount in ₹ and audit reason note are required!');
      return;
    }
    setActionLoading(true);

    try {
      const res = await apiFetch(`/admin/users/${modalUser.id}/wallet-adjust`, 'POST', {
        amountRs: parseFloat(adjustAmount),
        subBalanceType,
        actionType,
        reason: reason.trim()
      });

      if (res.status) {
        await showSuccess('Wallet Adjusted!', `Successfully ${actionType.toLowerCase()}ed ₹${adjustAmount} on ${modalUser.username}'s ${subBalanceType} balance.`);
        setModalUser(null);
        setAdjustAmount('');
        setReason('');
        fetchUsers();
      }
    } catch (err) {
      showError('Wallet Adjustment Failed', err.message || 'Failed to adjust user wallet balance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (user) => {
    const isBanning = user.status !== 'BANNED';
    const actionText = isBanning ? 'Ban User' : 'Unban User';

    const confirmed = await confirmAction(
      `${actionText}?`,
      `Are you sure you want to ${actionText.toLowerCase()} user "${user.username}"?`,
      `Yes, ${actionText}`
    );

    if (!confirmed) return;

    setTogglingUserId(user.id);
    try {
      const res = await apiFetch(`/admin/users/${user.id}/status`, 'PATCH', {
        status: isBanning ? 'BANNED' : 'ACTIVE',
        reason: 'Superadmin manual action from console'
      });

      if (res.status) {
        await showSuccess('Status Updated', `User ${user.username} is now ${isBanning ? 'BANNED' : 'ACTIVE'}`);
        fetchUsers();
      }
    } catch (err) {
      showError('Action Failed', err.message || 'Failed to update user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            User Management & Wallet Control
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Inspect registered players, check sub-balances, perform manual wallet credits/debits, or ban accounts.
          </p>
        </div>

        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '12px' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or mobile..."
            className="custom-input"
            style={{ width: '100%', paddingLeft: '2.625rem' }}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#818cf8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>User Handle</th>
              <th style={{ padding: '1rem 1.25rem' }}>Mobile</th>
              <th style={{ padding: '1rem 1.25rem' }}>Deposit Bal</th>
              <th style={{ padding: '1rem 1.25rem' }}>Winning Bal</th>
              <th style={{ padding: '1rem 1.25rem' }}>Bonus Bal</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem' }}>
                  <LudoLoader text="Loading Registered Players & Wallet Sub-Balances..." />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No users match search query.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={user.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #6366f1' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>{user.username}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {user.referralCode}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1', fontWeight: 600 }}>{user.mobile}</td>
                <td style={{ padding: '1rem 1.25rem', color: '#38bdf8', fontWeight: 800 }}>₹{user.wallet.depositBalanceRs}</td>
                <td style={{ padding: '1rem 1.25rem', color: '#34d399', fontWeight: 800 }}>₹{user.wallet.winningBalanceRs}</td>
                <td style={{ padding: '1rem 1.25rem', color: '#fbbf24', fontWeight: 800 }}>₹{user.wallet.bonusBalanceRs}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={user.status === 'BANNED' ? 'badge-rose' : 'badge-emerald'}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => setModalUser(user)}
                      className="btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Wallet size={14} color="#fbbf24" />
                      <span>Adjust Wallet</span>
                    </button>

                    <button
                      onClick={() => handleStatusToggle(user)}
                      disabled={togglingUserId === user.id}
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: user.status === 'BANNED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: user.status === 'BANNED' ? '#34d399' : '#f87171',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}
                    >
                      {togglingUserId === user.id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>{user.status === 'BANNED' ? 'Unban' : 'Ban'}</span>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="animate-modal" style={{ width: '100%', maxWidth: '480px', backgroundColor: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '24px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Adjust Wallet — {modalUser.username}
              </h3>
              <button onClick={() => setModalUser(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleWalletAdjustSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Action Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setActionType('CREDIT')} style={{ padding: '0.625rem', borderRadius: '8px', border: '1px solid', borderColor: actionType === 'CREDIT' ? '#10b981' : 'rgba(255,255,255,0.1)', backgroundColor: actionType === 'CREDIT' ? 'rgba(16,185,129,0.15)' : 'transparent', color: actionType === 'CREDIT' ? '#34d399' : '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>CREDIT (+)</button>
                  <button type="button" onClick={() => setActionType('DEBIT')} style={{ padding: '0.625rem', borderRadius: '8px', border: '1px solid', borderColor: actionType === 'DEBIT' ? '#f43f5e' : 'rgba(255,255,255,0.1)', backgroundColor: actionType === 'DEBIT' ? 'rgba(244,63,94,0.15)' : 'transparent', color: actionType === 'DEBIT' ? '#f87171' : '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>DEBIT (-)</button>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Sub-Balance Bucket</label>
                <select value={subBalanceType} onChange={(e) => setSubBalanceType(e.target.value)} className="custom-input" style={{ width: '100%' }}>
                  <option value="deposit">Deposit Wallet (₹{modalUser.wallet.depositBalanceRs})</option>
                  <option value="winning">Winning Wallet (₹{modalUser.wallet.winningBalanceRs})</option>
                  <option value="bonus">Bonus Wallet (₹{modalUser.wallet.bonusBalanceRs})</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Amount in Rupees (₹)</label>
                <input type="number" step="1" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="e.g. 500" required className="custom-input" style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Mandatory Audit Note Reason</label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Promotional Bonus / Disputed Refund" required className="custom-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalUser(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-primary">
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing Adjustment...</span>
                    </>
                  ) : (
                    <span>Confirm Adjustment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
