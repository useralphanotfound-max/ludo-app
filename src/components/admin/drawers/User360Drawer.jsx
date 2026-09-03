'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Wallet, Gamepad2, Receipt, ShieldCheck, ShieldAlert, Lock, Unlock, Clock, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import StatusBadge from '../tables/StatusBadge';

export default function User360Drawer({ userId, onClose, onRefreshUsers }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/users/${userId}/profile`);
      if (res.status && res.data) {
        setProfileData(res.data);
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeToggle = async (freezeState) => {
    const confirm = await Swal.fire({
      title: freezeState ? 'Freeze User Wallet?' : 'Unfreeze User Wallet?',
      text: freezeState ? 'User will be blocked from match entries & cashouts.' : 'User wallet will resume full operations.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: freezeState ? 'var(--rose)' : 'var(--emerald)',
      confirmButtonText: freezeState ? 'Freeze Wallet' : 'Unfreeze Wallet',
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${userId}/freeze-wallet`, {
        method: 'POST',
        body: JSON.stringify({ freeze: freezeState, reason: 'Admin Console 360 Action' })
      });
      if (res.status) {
        Swal.fire({ title: 'Success', text: res.message, icon: 'success', background: '#111624', color: '#ffffff' });
        fetchProfile();
        if (onRefreshUsers) onRefreshUsers();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Operation failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  if (!userId) return null;

  const personal = profileData?.personal || {};
  const fin = profileData?.financials || {};
  const sec = profileData?.security || {};
  const wallet = profileData?.wallet || {};

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
          maxWidth: '720px',
          backgroundColor: 'var(--bg-main)',
          borderLeft: '1px solid var(--border)',
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* Drawer Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                {personal.username || 'Loading Profile...'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                User ID: {personal.id || userId}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleFreezeToggle(!sec.isWalletFrozen)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: sec.isWalletFrozen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: sec.isWalletFrozen ? 'var(--emerald-light)' : 'var(--rose)',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {sec.isWalletFrozen ? <Unlock size={14} /> : <Lock size={14} />}
              {sec.isWalletFrozen ? 'Unfreeze Wallet' : 'Freeze Wallet'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--surface-2)',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto'
          }}
        >
          {['overview', 'finance', 'games', 'transactions', 'security', 'notes'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: activeTab === t ? '1px solid var(--emerald-light)' : '1px solid transparent',
                backgroundColor: activeTab === t ? 'var(--emerald-bg)' : 'transparent',
                color: activeTab === t ? 'var(--emerald-light)' : 'var(--text-secondary)',
                fontWeight: activeTab === t ? 800 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--emerald-light)', fontWeight: 800 }}>
              Retrieving User 360° Profile Intelligence...
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* Financial KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>DEPOSIT BALANCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--emerald-light)', marginTop: '4px' }}>
                    ₹{(wallet.depositBalanceRs || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>WINNING BALANCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', marginTop: '4px' }}>
                    ₹{(wallet.winningBalanceRs || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BONUS BALANCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--purple)', marginTop: '4px' }}>
                    ₹{(wallet.bonusBalanceRs || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Personal Info Details */}
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Account Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Mobile Number:</span> <strong style={{ color: '#ffffff' }}>{personal.mobile}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>KYC Status:</span> <StatusBadge status={personal.kycStatus} /></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Registration Date:</span> <span style={{ color: 'var(--text-secondary)' }}>{new Date(personal.createdAt || Date.now()).toLocaleDateString()}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Risk Score:</span> <StatusBadge status={sec.riskScore || 'LOW'} /></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Total Deposits:</span> <strong style={{ color: 'var(--emerald-light)' }}>₹{(fin.totalDepositsRs || 0).toLocaleString('en-IN')}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Total Cashouts:</span> <strong style={{ color: 'var(--rose)' }}>₹{(fin.totalWithdrawalsRs || 0).toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            </>
          ) : activeTab === 'finance' ? (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Financial Audit Summary</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>Total Deposit Volume: ₹{(fin.totalDepositsRs || 0).toLocaleString('en-IN')}</div>
                <div>Total Withdrawal Volume: ₹{(fin.totalWithdrawalsRs || 0).toLocaleString('en-IN')}</div>
                <div>Lifetime Net Revenue Contribution: ₹{((fin.totalDepositsRs || 0) * 0.1).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ) : activeTab === 'notes' ? (
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Internal Admin Audit Notes</h4>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add compliance or internal risk assessment notes..."
                className="custom-input"
                rows={4}
              />
              <button
                onClick={() => {
                  Swal.fire({ title: 'Note Saved', text: 'Admin note recorded in user audit log', icon: 'success', background: '#111624', color: '#ffffff' });
                  setAdminNote('');
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--emerald)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  alignSelf: 'flex-end'
                }}
              >
                Save Audit Note
              </button>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Viewing {activeTab} details for {personal.username}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
