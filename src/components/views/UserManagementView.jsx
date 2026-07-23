import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, DollarSign, ShieldAlert, CheckCircle, Wallet, AlertCircle, X } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Wallet adjustment modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [amountRs, setAmountRs] = useState('');
  const [subBalanceType, setSubBalanceType] = useState('deposit');
  const [actionType, setActionType] = useState('CREDIT');
  const [reason, setReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/users?search=${encodeURIComponent(searchTerm)}`);
      if (res.status) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    const confirm = window.confirm(`Are you sure you want to change ${user.username}'s status to ${newStatus}?`);
    if (!confirm) return;

    try {
      const res = await apiFetch(`/admin/users/${user.id}/status`, 'PATCH', { status: newStatus, reason: 'Superadmin manual toggle' });
      if (res.status) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWalletAdjustSubmit = async (e) => {
    e.preventDefault();
    setActionMessage('');
    if (!selectedUser || !amountRs || !reason) {
      alert('Please enter amount and reason');
      return;
    }

    try {
      const res = await apiFetch(`/admin/users/${selectedUser.id}/wallet-adjust`, 'POST', {
        amountRs: parseFloat(amountRs),
        subBalanceType,
        actionType,
        reason
      });

      if (res.status) {
        setActionMessage(`✅ ${res.message}`);
        setTimeout(() => {
          setAdjustModalOpen(false);
          setSelectedUser(null);
          setAmountRs('');
          setReason('');
          setActionMessage('');
          fetchUsers();
        }, 1200);
      }
    } catch (err) {
      setActionMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            User & Wallet Registry
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Inspect profiles, manage sub-balances, perform manual credits/debits, and control account statuses.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.625rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search username or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input"
              style={{ width: '280px', paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#090d16', color: '#64748b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>User Profile</th>
              <th style={{ padding: '1rem 1.25rem' }}>Mobile / IP</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem' }}>Typed Sub-Balances</th>
              <th style={{ padding: '1rem 1.25rem' }}>Total Balance</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Fetching User Registry...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No registered users found matching query.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <img src={u.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', backgroundColor: '#090d16' }} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>{u.username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{u.referralCode}</span></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{u.mobile}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>IP: {u.lastLoginIp || '127.0.0.1'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={u.status === 'BANNED' ? 'badge-rose' : 'badge-emerald'}>
                      ● {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        Dep: ₹{u.wallet.depositBalanceRs}
                      </span>
                      <span style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                        Win: ₹{u.wallet.winningBalanceRs}
                      </span>
                      <span style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        Bon: ₹{u.wallet.bonusBalanceRs}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#f59e0b' }}>
                      ₹{u.wallet.totalBalanceRs}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setSelectedUser(u); setAdjustModalOpen(true); }}
                        className="btn-primary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <DollarSign size={14} /> Adjust Wallet
                      </button>

                      <button
                        onClick={() => handleStatusToggle(u)}
                        className={u.status === 'BANNED' ? 'btn-success' : 'btn-danger'}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {u.status === 'BANNED' ? 'Unban User' : 'Ban User'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Wallet Adjustment Modal */}
      {adjustModalOpen && selectedUser && (
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
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={22} color="#f59e0b" /> Adjust Wallet: {selectedUser.username}
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1.25rem 0' }}>
              Perform a manual credit or debit on typed sub-balances. Logged immutably in Audit Trail.
            </p>

            {actionMessage && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#090d16', fontSize: '0.875rem', marginBottom: '1.25rem', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                {actionMessage}
              </div>
            )}

            <form onSubmit={handleWalletAdjustSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Action Type
                </label>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <button
                    type="button"
                    onClick={() => setActionType('CREDIT')}
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      borderRadius: '10px',
                      border: actionType === 'CREDIT' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: actionType === 'CREDIT' ? 'rgba(16, 185, 129, 0.2)' : '#0b1120',
                      color: actionType === 'CREDIT' ? '#34d399' : '#94a3b8',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ➕ CREDIT (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('DEBIT')}
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      borderRadius: '10px',
                      border: actionType === 'DEBIT' ? '2px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: actionType === 'DEBIT' ? 'rgba(244, 63, 94, 0.2)' : '#0b1120',
                      color: actionType === 'DEBIT' ? '#f87171' : '#94a3b8',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ➖ DEBIT (-)
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Target Sub-Balance
                </label>
                <select
                  value={subBalanceType}
                  onChange={(e) => setSubBalanceType(e.target.value)}
                  className="custom-input"
                  style={{ width: '100%' }}
                >
                  <option value="deposit">Deposit Balance</option>
                  <option value="winning">Winning Balance</option>
                  <option value="bonus">Bonus Balance</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Amount in Rupees (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amountRs}
                  onChange={(e) => setAmountRs(e.target.value)}
                  required
                  className="custom-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Mandatory Audit Reason Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for manual adjustment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="custom-input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setAdjustModalOpen(false); setSelectedUser(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
