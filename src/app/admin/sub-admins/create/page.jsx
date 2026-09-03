'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/admin/layout/AppShell';
import { UserCheck, Shield, KeyRound, ArrowLeft, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CreateSubAdminPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FINANCE_MANAGER');
  const [approvalLimitRs, setApprovalLimitRs] = useState(25000);
  const [require2FA, setRequire2FA] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const rolePreviews = {
    FINANCE_MANAGER: {
      granted: ['Wallets View & Freeze', 'Deposits View & Reconcile', 'Withdrawals Approval (up to limit)', 'Transactions Ledger View'],
      restricted: ['User Ban / Delete', 'Game Intervene / Cancel', 'Anti-Cheat Risk Matrix', 'System Settings']
    },
    OPERATIONS_ADMIN: {
      granted: ['Users View & Suspend', 'Games View & Intervene', 'Disputes Award Win / Refund', 'Support Tickets Resolve'],
      restricted: ['Wallet Manual Balance Adjustment', 'Roles & Permission Editing', 'System Settings']
    },
    SUPPORT_MANAGER: {
      granted: ['Support Tickets Respond & Close', 'Game Disputes View & Evidence', 'User Overview View'],
      restricted: ['Financial Adjustments', 'Withdrawal Approvals', 'System Configuration']
    }
  };

  const currentPreview = rolePreviews[role] || rolePreviews.FINANCE_MANAGER;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({ title: 'Fields Required', text: 'Enter username and password', icon: 'warning', background: '#111624', color: '#ffffff' });
      return;
    }

    try {
      setSubmitting(true);
      Swal.fire({
        title: 'Sub-Admin Created!',
        text: `Sub-admin account @${username} initialized with ${role} privileges.`,
        icon: 'success',
        background: '#111624',
        color: '#ffffff'
      }).then(() => {
        router.push('/admin/sub-admins');
      });
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'CreationFailed', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push('/admin/sub-admins')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div>
            <div className="micro-label">SUPER ADMIN DELEGATION</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0 0', letterSpacing: '-0.03em' }}>
              Create New Sub-Admin Account
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          {/* Main Account Details Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Account Credentials</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Username (@handle)</label>
                <input
                  type="text"
                  placeholder="e.g. arjun_finance"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Display Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Mehta"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Initial Passcode</label>
              <input
                type="password"
                placeholder="Enter strong password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Assigned Role Template</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="custom-input">
                  <option value="FINANCE_MANAGER">FINANCE MANAGER</option>
                  <option value="OPERATIONS_ADMIN">OPERATIONS ADMIN</option>
                  <option value="SUPPORT_MANAGER">SUPPORT MANAGER</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Approval Threshold Limit (INR ₹)</label>
                <input
                  type="number"
                  value={approvalLimitRs}
                  onChange={(e) => setApprovalLimitRs(parseInt(e.target.value) || 0)}
                  className="custom-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--emerald)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Creating...' : 'Initialize Sub-Admin Account'}
              </button>
            </div>
          </div>

          {/* Live Effective Access Preview Box */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--emerald-glow)' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--emerald-light)' }}>EFFECTIVE ACCESS PREVIEW</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Role: <strong style={{ color: '#ffffff' }}>{role}</strong></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--emerald-light)', marginBottom: '2px' }}>GRANTED MODULE ACCESS</div>
              {currentPreview.granted.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ffffff' }}>
                  <Check size={14} color="var(--emerald-light)" /> {g}
                </div>
              ))}

              <div style={{ fontWeight: 800, color: 'var(--rose)', marginTop: '0.75rem', marginBottom: '2px' }}>RESTRICTED ACTIONS</div>
              {currentPreview.restricted.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                  <X size={14} color="var(--rose)" /> {r}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
