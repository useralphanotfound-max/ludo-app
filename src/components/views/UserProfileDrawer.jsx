'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Unlock, ShieldAlert, Smartphone, Laptop, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';

export default function UserProfileDrawer({ userId, onClose, onRefreshUsers }) {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
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
      text: freezeState ? 'User will not be able to join games or withdraw funds.' : 'User wallet will resume full functionality.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: freezeState ? '#ef4444' : '#10b981',
      confirmButtonText: freezeState ? 'Freeze Wallet' : 'Unfreeze Wallet',
      background: '#0f1424',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${userId}/freeze-wallet`, {
        method: 'POST',
        body: JSON.stringify({ freeze: freezeState, reason: 'Admin Console Action' })
      });
      if (res.status) {
        Swal.fire({ title: 'Success', text: res.message, icon: 'success', background: '#0f1424', color: '#ffffff' });
        fetchUserProfile();
        if (onRefreshUsers) onRefreshUsers();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Operation failed', icon: 'error', background: '#0f1424', color: '#ffffff' });
    }
  };

  if (!userId) return null;

  const personal = profileData?.personal || {};
  const fin = profileData?.financials || {};
  const sec = profileData?.security || {};

  const userInitials = (personal.username || 'PN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PN';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: '#090b16',
      overflowY: 'auto',
      color: '#f8fafc',
      padding: '1.75rem 2rem'
    }}>
      {/* Back Button matching Screenshot 4 */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft size={16} /> Back to users
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
          Loading User Details & Session Intelligence...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Row matching Screenshot 4 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: '#192138',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#60a5fa'
              }}>
                {userInitials}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    {personal.username || 'Priya Nair'}
                  </h2>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: personal.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: personal.status === 'ACTIVE' ? '#34d399' : '#f87171'
                  }}>
                    {personal.status || 'Active'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                  {personal.id ? `U-${personal.id.slice(-5)}` : 'U-77341'} • {personal.maskedMobile || '98••••6634'}
                </div>
              </div>
            </div>

            {/* Action Buttons Right */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleFreezeToggle(!personal.isWalletFrozen)}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {personal.isWalletFrozen ? <Unlock size={16} color="#34d399" /> : <Lock size={16} color="#60a5fa" />}
                <span>{personal.isWalletFrozen ? 'Unfreeze wallet' : 'Freeze wallet'}</span>
              </button>

              <button
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldAlert size={16} /> Suspend
              </button>
            </div>
          </div>

          {/* Grid Layout matching Screenshot 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {/* Left Box 1: FINANCIAL OVERVIEW -> Wallet Breakdown */}
            <div style={{ backgroundColor: '#111625', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FINANCIAL OVERVIEW</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0' }}>Wallet breakdown</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
                <div style={{ backgroundColor: '#181f33', padding: '1rem 0.875rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cash Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                    ₹{(fin.wallet?.cashRs || 9400).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ backgroundColor: '#181f33', padding: '1rem 0.875rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Bonus Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                    ₹{(fin.wallet?.bonusRs || 200).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ backgroundColor: '#181f33', padding: '1rem 0.875rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Winning Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                    ₹{(fin.wallet?.winningRs || 8800).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ backgroundColor: '#181f33', padding: '1rem 0.875rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Locked Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                    ₹{(fin.wallet?.lockedRs || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box 1: SECURITY -> Devices & Sessions */}
            <div style={{ backgroundColor: '#111625', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SECURITY</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0' }}>Devices & sessions</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ padding: '0.875rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Smartphone size={18} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>iPhone 14 • Mumbai</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Active 9m ago</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                    Flagged
                  </span>
                </div>

                <div style={{ padding: '0.875rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Laptop size={18} color="#94a3b8" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>Chrome / Windows • Pune</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Active 3d ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Left Box 2: LEDGER -> Recent Transactions */}
            <div style={{ backgroundColor: '#111625', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LEDGER</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0' }}>Recent transactions</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ padding: '0.875rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>TXN-90142</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Withdrawal • 9m ago</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>₹18,400</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                      Flagged
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.875rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>TXN-90101</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Deposit • 1d ago</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>₹5,000</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                      Success
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box 2: SECURITY -> Login History */}
            <div style={{ backgroundColor: '#111625', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SECURITY</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0' }}>Login history</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                    <MapPin size={14} color="#60a5fa" />
                    <span>103.22.xx.xx Mumbai, IN</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>9m ago</span>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                    <MapPin size={14} color="#60a5fa" />
                    <span>103.22.xx.xx Mumbai, IN</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>2h ago</span>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#181f33', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700 }}>
                    <MapPin size={14} color="#f87171" />
                    <span>41.90.xx.xx Lagos, NG (Suspicious Location)</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>1d ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
