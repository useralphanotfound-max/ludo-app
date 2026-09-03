'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Search, ArrowUpRight, ArrowDownLeft, Lock, RefreshCw, ShieldAlert, PlusCircle, MinusCircle, FileText, TrendingUp, ShieldCheck, Coins } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function WalletManagementView({ permissions = {} }) {
  if (!hasPermission(permissions, 'wallets.view')) {
    return <AccessDeniedState module="Wallet" permission="wallets.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Balance Adjustment Form State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustUser, setAdjustUser] = useState(null);
  const [actionType, setActionType] = useState('CREDIT');
  const [subBalanceType, setSubBalanceType] = useState('deposit');
  const [amountRs, setAmountRs] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [walletStats, setWalletStats] = useState(null);

  useEffect(() => {
    fetchWalletUsers();
    fetchWalletStats();
  }, [search]);

  const fetchWalletUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/users?search=${encodeURIComponent(search)}&limit=50`);
      if (res.status && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error('Wallet users error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletStats = async () => {
    try {
      const res = await apiFetch('/admin/wallets');
      if (res.status && res.data) {
        setWalletStats(res.data);
      }
    } catch (e) {
      console.error('Wallet stats error:', e);
    }
  };

  const openAdjustmentModal = (user) => {
    setAdjustUser(user);
    setActionType('CREDIT');
    setSubBalanceType('deposit');
    setAmountRs('');
    setReason('');
    setShowAdjustModal(true);
  };

  const handleWalletAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustUser) return;
    if (!amountRs || parseFloat(amountRs) <= 0) {
      Swal.fire({ title: 'Invalid Amount', text: 'Enter an amount greater than ₹0', icon: 'error', background: '#0f1322', color: '#ffffff' });
      return;
    }
    if (!reason || reason.trim().length < 5) {
      Swal.fire({ title: 'Reason Required', text: 'Audit trail requires a clear reason (minimum 5 characters)', icon: 'warning', background: '#0f1322', color: '#ffffff' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(`/admin/users/${adjustUser.id}/wallet-adjust`, {
        method: 'POST',
        body: JSON.stringify({
          actionType,
          subBalanceType,
          amountRs: parseFloat(amountRs),
          reason: reason.trim(),
          adminUsername: 'SuperAdmin'
        })
      });

      if (res.status) {
        Swal.fire({ title: 'Adjustment Success', text: res.message, icon: 'success', background: '#0f1322', color: '#ffffff' });
        setShowAdjustModal(false);
        fetchWalletUsers();
        fetchWalletStats();
      }
    } catch (e) {
      Swal.fire({ title: 'Adjustment Failed', text: e.message || 'Failed to execute financial adjustment', icon: 'error', background: '#0f1322', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreezeToggle = async (user) => {
    const freezeState = !user.isWalletFrozen;
    const confirm = await Swal.fire({
      title: freezeState ? `Freeze Wallet for ${user.username}?` : `Unfreeze Wallet for ${user.username}?`,
      text: freezeState ? 'The user will be blocked from match entries & cashouts.' : 'The user wallet will resume normal operations.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: freezeState ? '#ef4444' : '#22c55e',
      confirmButtonText: freezeState ? 'Freeze Wallet' : 'Unfreeze Wallet',
      background: '#0f1322',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${user.id}/freeze-wallet`, {
        method: 'POST',
        body: JSON.stringify({ freeze: freezeState, reason: 'Console Freeze Toggle' })
      });

      if (res.status) {
        Swal.fire({ title: 'Success', text: res.message, icon: 'success', background: '#0f1322', color: '#ffffff' });
        fetchWalletUsers();
        fetchWalletStats();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message, icon: 'error', background: '#0f1322', color: '#ffffff' });
    }
  };

  // Calculate Aggregates
  const totalCashRs = walletStats?.totalCashRs !== undefined ? walletStats.totalCashRs : users.reduce((sum, u) => sum + (u.wallet?.depositBalanceRs || 0), 0);
  const totalWinningRs = walletStats?.totalWinningRs !== undefined ? walletStats.totalWinningRs : users.reduce((sum, u) => sum + (u.wallet?.winningBalanceRs || 0), 0);
  const totalBonusRs = walletStats?.totalBonusRs !== undefined ? walletStats.totalBonusRs : users.reduce((sum, u) => sum + (u.wallet?.bonusBalanceRs || 0), 0);
  const frozenCount = walletStats?.frozenCount !== undefined ? walletStats.frozenCount : users.filter(u => u.isWalletFrozen).length;

  const miniStats = [
    { label: 'Cash pool', value: `₹${totalCashRs.toLocaleString('en-IN')}`, icon: <Coins size={15} />, color: '#34d399', trend: walletStats?.growthTrend || '+0.0% this week', trendColor: '#34d399' },
    { label: 'Winning pool', value: `₹${totalWinningRs.toLocaleString('en-IN')}`, icon: <TrendingUp size={15} />, color: '#facc15', trend: 'Payout-ready', trendColor: '#facc15' },
    { label: 'Bonus pool', value: `₹${totalBonusRs.toLocaleString('en-IN')}`, icon: <ShieldCheck size={15} />, color: '#c084fc', trend: 'Promos active', trendColor: '#c084fc' },
    { label: 'Frozen wallets', value: `${frozenCount}`, icon: <Lock size={15} />, color: '#f87171', trend: 'Need review', trendColor: '#f87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="FINANCIAL OPERATIONS"
        title="Wallet control console"
        subtitle="Independent balance oversight, controlled adjustments, and real-time user cash health."
        stats={miniStats}
        actions={[
          { label: 'Sync balances', onClick: fetchWalletUsers, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Aggregate KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#86efac', textTransform: 'uppercase' }}>Total Cash (Deposit) Pool</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4ade80', marginTop: '6px' }}>
            ₹{totalCashRs.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(250, 204, 21, 0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase' }}>Total Winning Pool</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#facc15', marginTop: '6px' }}>
            ₹{totalWinningRs.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d8b4fe', textTransform: 'uppercase' }}>Total Bonus Balance Pool</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c084fc', marginTop: '6px' }}>
            ₹{totalBonusRs.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ backgroundColor: '#0f1322', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search wallet by username, mobile, or User ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="custom-input"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {/* Wallet Table */}
      <div style={{ backgroundColor: '#0f1322', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#13192e', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem' }}>User Profile</th>
              <th style={{ padding: '1rem' }}>Cash (Deposit)</th>
              <th style={{ padding: '1rem' }}>Winning</th>
              <th style={{ padding: '1rem' }}>Bonus</th>
              <th style={{ padding: '1rem' }}>Total Balance</th>
              <th style={{ padding: '1rem' }}>Wallet Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#facc15', fontWeight: 800 }}>
                  Fetching User Wallets...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No user wallets found matching search criteria.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>{u.username}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.maskedMobile}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#4ade80' }}>
                    ₹{u.wallet?.depositBalanceRs?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#facc15' }}>
                    ₹{u.wallet?.winningBalanceRs?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#c084fc' }}>
                    ₹{u.wallet?.bonusBalanceRs?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#ffffff', fontSize: '0.95rem' }}>
                    ₹{u.wallet?.totalBalanceRs?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: u.isWalletFrozen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: u.isWalletFrozen ? '#f87171' : '#4ade80'
                    }}>
                      {u.isWalletFrozen ? 'FROZEN' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => openAdjustmentModal(u)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#facc15',
                          color: '#000000',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        ⚡ Adjust Balance
                      </button>
                      <button
                        onClick={() => handleFreezeToggle(u)}
                        style={{
                          padding: '0.4rem 0.625rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: u.isWalletFrozen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: u.isWalletFrozen ? '#4ade80' : '#f87171',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {u.isWalletFrozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controlled Balance Adjustment Modal */}
      {showAdjustModal && adjustUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#0f1322',
            borderRadius: '20px',
            border: '1.5px solid rgba(250, 204, 21, 0.4)',
            padding: '1.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#facc15', margin: 0 }}>
                  Controlled Wallet Adjustment
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  Target User: <strong style={{ color: '#ffffff' }}>{adjustUser.username}</strong> ({adjustUser.maskedMobile})
                </div>
              </div>
              <button onClick={() => setShowAdjustModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <RefreshCw size={20} />
              </button>
            </div>

            <form onSubmit={handleWalletAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Adjustment Action</label>
                  <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="custom-input">
                    <option value="CREDIT">CREDIT (+ Add Money)</option>
                    <option value="DEBIT">DEBIT (- Deduct Money)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Sub-Balance Bucket</label>
                  <select value={subBalanceType} onChange={(e) => setSubBalanceType(e.target.value)} className="custom-input">
                    <option value="deposit">Deposit (Cash)</option>
                    <option value="winning">Winning Balance</option>
                    <option value="bonus">Bonus Balance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Amount (in INR ₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={amountRs}
                  onChange={(e) => setAmountRs(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mandatory Reason for Audit Log</label>
                <textarea
                  placeholder="State clear reason for audit compliance..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="custom-input"
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: actionType === 'CREDIT' ? '#22c55e' : '#ef4444',
                    color: '#ffffff',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Executing Adjustment...' : `Confirm ${actionType} ₹${amountRs || '0'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
