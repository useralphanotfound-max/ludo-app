'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, KeyRound, Lock, Unlock, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import StatusBadge from '../tables/StatusBadge';

export default function AdminDrawer({ adminAccount, onClose, onRefresh }) {
  const [role, setRole] = useState(adminAccount?.role || 'FINANCE_MANAGER');
  const [approvalLimitRs, setApprovalLimitRs] = useState(adminAccount?.approvalLimitRs || 25000);
  const [require2FA, setRequire2FA] = useState(adminAccount?.require2FA ?? true);
  const [status, setStatus] = useState(adminAccount?.status || 'ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  if (!adminAccount) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      Swal.fire({ title: 'Sub-Admin Updated', text: `Permissions & limits saved for @${adminAccount.username}`, icon: 'success', background: '#111624', color: '#ffffff' });
      onRefresh && onRefresh();
      onClose();
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Save failed', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(7, 9, 19, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--bg-main)',
          borderLeft: '1px solid var(--border)',
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Sub-Admin Account — {adminAccount.username}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Created: {adminAccount.createdAt ? new Date(adminAccount.createdAt).toLocaleDateString() : '03 Sep 2026'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Assigned Primary Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="custom-input">
              <option value="SUPERADMIN">SUPERADMIN (Full Unrestricted Access)</option>
              <option value="OPERATIONS_ADMIN">OPERATIONS ADMIN (Users, Games, Disputes)</option>
              <option value="FINANCE_MANAGER">FINANCE MANAGER (Wallets, Deposits, Cashouts)</option>
              <option value="SUPPORT_MANAGER">SUPPORT MANAGER (Tickets, Disputes)</option>
              <option value="RISK_MANAGER">RISK MANAGER (Anti-cheat, Fraud Matrix)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Financial Approval Threshold Limit (INR ₹)</label>
            <input
              type="number"
              value={approvalLimitRs}
              onChange={(e) => setApprovalLimitRs(parseInt(e.target.value) || 0)}
              className="custom-input"
              placeholder="e.g. 25000"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Withdrawals above ₹{approvalLimitRs.toLocaleString('en-IN')} will require dual-approval from a Senior Admin.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Account Operational Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="custom-input">
              <option value="ACTIVE">ACTIVE (Full Login Access)</option>
              <option value="SUSPENDED">SUSPENDED (Temporary Freeze)</option>
              <option value="LOCKED">LOCKED (Password Reset Required)</option>
            </select>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>Enforce 2FA Authentication</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Require TOTP code on every login</div>
            </div>
            <input
              type="checkbox"
              checked={require2FA}
              onChange={(e) => setRequire2FA(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--emerald)' }}
            />
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Saving Sub-Admin...' : 'Save Privileges & Limits'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
