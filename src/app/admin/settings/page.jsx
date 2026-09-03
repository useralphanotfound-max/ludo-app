'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { Settings, Save, ShieldAlert, Percent, DollarSign, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    platformCommissionPct: 10,
    minDepositRs: 50,
    maxDepositRs: 50000,
    minWithdrawRs: 100,
    maxWithdrawRs: 25000,
    maintenanceMode: false,
    maintenanceMessage: 'System under scheduled maintenance. Gameplay will resume shortly.',
    forceUpdateVersion: '1.0.0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/settings');
      if (res.status && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/admin/settings', 'PUT', settings);
      if (res.status) {
        Swal.fire({ title: 'Settings Saved!', text: 'System game settings and maintenance configuration updated.', icon: 'success', background: '#111624', color: '#ffffff' });
        fetchSettings();
      }
    } catch (err) {
      Swal.fire({ title: 'Save Failed', text: err.message || 'Failed to update system settings', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Save */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">SYSTEM CONFIGURATION & EMERGENCY CONTROLS</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <Settings size={26} color="var(--emerald-light)" /> System & Game Configuration
            </h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald)',
              color: '#000000',
              fontWeight: 900,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Maintenance Warning Banner if active */}
        {settings.maintenanceMode && (
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--rose)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--rose)' }}>
            <ShieldAlert size={24} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>EMERGENCY MAINTENANCE MODE IS CURRENTLY ACTIVE!</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--rose)', marginTop: '2px' }}>Mobile matchmaking is currently paused. Notice: "{settings.maintenanceMessage}"</div>
            </div>
          </div>
        )}

        {/* 3 Active Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Platform Commission Fee" value={`${settings.platformCommissionPct}%`} trend="GGR cut per match" trendType="neutral" icon={Percent} badgeColor="gold" />
          <StatCard title="Deposit Limits (Min/Max)" value={`₹${settings.minDepositRs} - ₹${settings.maxDepositRs.toLocaleString('en-IN')}`} trend="Enforced on UPI" trendType="neutral" icon={DollarSign} badgeColor="emerald" />
          <StatCard title="Cashout Limits (Min/Max)" value={`₹${settings.minWithdrawRs} - ₹${settings.maxWithdrawRs.toLocaleString('en-IN')}`} trend="Enforced on Payouts" trendType="neutral" icon={DollarSign} badgeColor="emerald" />
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Commission Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Percent size={18} color="var(--gold)" /> Platform Commission Cut
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                Match Commission Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={settings.platformCommissionPct}
                onChange={(e) => setSettings({ ...settings, platformCommissionPct: parseFloat(e.target.value) || 0 })}
                className="custom-input"
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.375rem', display: 'block' }}>
                Cut automatically deducted from total match prize pool (Default: 10%).
              </span>
            </div>
          </div>

          {/* Limits Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="var(--emerald-light)" /> Deposit & Cashout Thresholds
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Min Deposit (₹)</label>
                <input
                  type="number"
                  value={settings.minDepositRs}
                  onChange={(e) => setSettings({ ...settings, minDepositRs: parseInt(e.target.value) || 0 })}
                  className="custom-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Max Deposit (₹)</label>
                <input
                  type="number"
                  value={settings.maxDepositRs}
                  onChange={(e) => setSettings({ ...settings, maxDepositRs: parseInt(e.target.value) || 0 })}
                  className="custom-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Min Cashout (₹)</label>
                <input
                  type="number"
                  value={settings.minWithdrawRs}
                  onChange={(e) => setSettings({ ...settings, minWithdrawRs: parseInt(e.target.value) || 0 })}
                  className="custom-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Max Cashout (₹)</label>
                <input
                  type="number"
                  value={settings.maxWithdrawRs}
                  onChange={(e) => setSettings({ ...settings, maxWithdrawRs: parseInt(e.target.value) || 0 })}
                  className="custom-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Maintenance Card */}
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={18} color="var(--rose)" /> Emergency Platform Maintenance Mode
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Instantly pause mobile matchmaking and display maintenance notice banner across all active apps.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: settings.maintenanceMode ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: settings.maintenanceMode ? 'var(--rose)' : 'var(--emerald-light)',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {settings.maintenanceMode ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                <span>{settings.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEM OPERATIONAL'}</span>
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                Maintenance Notice Announcement Text
              </label>
              <input
                type="text"
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                className="custom-input"
                required
              />
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
