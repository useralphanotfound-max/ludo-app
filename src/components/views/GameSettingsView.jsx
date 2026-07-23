'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Percent, DollarSign, ToggleLeft, ToggleRight, CheckCircle2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { showSuccess, showError } from '@/lib/swal';
import LudoLoader from '@/components/common/LudoLoader';

export default function GameSettingsView() {
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
        await showSuccess('Settings Saved!', 'Game settings and maintenance configuration updated.');
        fetchSettings();
      }
    } catch (err) {
      showError('Save Failed', err.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LudoLoader text="Loading System Game Settings..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            System & Game Configuration
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Manage platform commission percentage, deposit/cashout limits, and emergency maintenance controls.
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-gold" style={{ padding: '0.625rem 1.25rem' }}>
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Saving Configurations...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel card-gold-border" style={{ borderRadius: '20px', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Percent size={20} color="#facc15" />
            Platform Commission & Fees
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Match Commission Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={settings.platformCommissionPct}
              onChange={(e) => setSettings({ ...settings, platformCommissionPct: parseFloat(e.target.value) || 0 })}
              className="custom-input"
              style={{ width: '100%' }}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem', display: 'block' }}>
              Cut automatically deducted from total match prize pool (Default: 10%).
            </span>
          </div>
        </div>

        <div className="glass-panel card-green-border" style={{ borderRadius: '20px', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <DollarSign size={20} color="#4ade80" />
            Deposit & Cashout Limits
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Min Deposit (₹)</label>
              <input
                type="number"
                value={settings.minDepositRs}
                onChange={(e) => setSettings({ ...settings, minDepositRs: parseInt(e.target.value) || 0 })}
                className="custom-input"
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Max Deposit (₹)</label>
              <input
                type="number"
                value={settings.maxDepositRs}
                onChange={(e) => setSettings({ ...settings, maxDepositRs: parseInt(e.target.value) || 0 })}
                className="custom-input"
                style={{ width: '100%' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Min Cashout (₹)</label>
              <input
                type="number"
                value={settings.minWithdrawRs}
                onChange={(e) => setSettings({ ...settings, minWithdrawRs: parseInt(e.target.value) || 0 })}
                className="custom-input"
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Max Cashout (₹)</label>
              <input
                type="number"
                value={settings.maxWithdrawRs}
                onChange={(e) => setSettings({ ...settings, maxWithdrawRs: parseInt(e.target.value) || 0 })}
                className="custom-input"
                style={{ width: '100%' }}
                required
              />
            </div>
          </div>
        </div>

        <div className="glass-panel card-red-border" style={{ gridColumn: '1 / -1', borderRadius: '20px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <ShieldAlert size={20} color="#f87171" />
                Emergency Maintenance Mode
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                Instantly pause mobile app matchmaking and display maintenance notice banner.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: settings.maintenanceMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: settings.maintenanceMode ? '#f87171' : '#4ade80',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {settings.maintenanceMode ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              <span>{settings.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEM OPERATIONAL'}</span>
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Maintenance Notice Announcement Message
            </label>
            <input
              type="text"
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              className="custom-input"
              style={{ width: '100%' }}
              required
            />
          </div>
        </div>
      </form>
    </div>
  );
}
