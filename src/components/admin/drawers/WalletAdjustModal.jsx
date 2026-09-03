'use client';

import React, { useState } from 'react';
import { X, Coins, ShieldAlert, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';

export default function WalletAdjustModal({ user, onClose, onSuccess }) {
  const [actionType, setActionType] = useState('CREDIT');
  const [subBalanceType, setSubBalanceType] = useState('deposit');
  const [amountRs, setAmountRs] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amountRs || parseFloat(amountRs) <= 0) {
      Swal.fire({ title: 'Invalid Amount', text: 'Enter an amount greater than ₹0', icon: 'error', background: '#111624', color: '#ffffff' });
      return;
    }
    if (!reason || reason.trim().length < 5) {
      Swal.fire({ title: 'Reason Required', text: 'Audit trail requires a clear reason (minimum 5 characters)', icon: 'warning', background: '#111624', color: '#ffffff' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(`/admin/users/${user.id}/wallet-adjust`, {
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
        Swal.fire({ title: 'Adjustment Executed', text: res.message, icon: 'success', background: '#111624', color: '#ffffff' });
        onSuccess && onSuccess();
        onClose();
      }
    } catch (e) {
      Swal.fire({ title: 'Adjustment Failed', text: e.message || 'Failed to execute financial adjustment', icon: 'error', background: '#111624', color: '#ffffff' });
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(7, 9, 19, 0.85)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          border: '1.5px solid var(--gold)',
          padding: '1.5rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coins size={20} /> Controlled Wallet Adjustment
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Target Account: <strong style={{ color: '#ffffff' }}>{user.username}</strong> ({user.maskedMobile})
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Adjustment Action</label>
              <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="custom-input">
                <option value="CREDIT">CREDIT (+ Add Money)</option>
                <option value="DEBIT">DEBIT (- Deduct Money)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Sub-Balance Bucket</label>
              <select value={subBalanceType} onChange={(e) => setSubBalanceType(e.target.value)} className="custom-input">
                <option value="deposit">Deposit (Cash)</option>
                <option value="winning">Winning Balance</option>
                <option value="bonus">Bonus Balance</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Amount (in INR ₹)</label>
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
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Mandatory Reason for Audit Log</label>
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
                backgroundColor: actionType === 'CREDIT' ? 'var(--emerald)' : 'var(--rose)',
                color: actionType === 'CREDIT' ? '#000000' : '#ffffff',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Executing...' : `Confirm ${actionType} ₹${amountRs || '0'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
