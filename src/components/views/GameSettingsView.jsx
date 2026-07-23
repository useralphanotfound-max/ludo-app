'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertOctagon, Check } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { showSuccess, showError } from '@/lib/swal';

export default function GameSettingsView() {
  const [settings, setSettings] = useState({
    platformCommissionPct: 10,
    minDepositRs: 50,
    maxDepositRs: 50000,
    minWithdrawRs: 100,
    maxWithdrawRs: 25000,
    maintenanceMode: false,
    maintenanceMessage: 'Royal Ludo is undergoing maintenance. Back soon!',
    forceUpdateVersion: '1.0.0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
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
        showSuccess('Settings Saved!', 'Game commission and system limits updated successfully.');
      }
    } catch (err) {
      showError('Update Failed', err.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
          System Game Settings
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Configure platform commission, deposit/cashout limits, app force update version, and maintenance mode.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={20} color="#f59e0b" />
              Commission & Deposit Limits
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Platform Match Commission (%)</label>
              <input type="number" value={settings.platformCommissionPct} onChange={(e) => setSettings({ ...settings, platformCommissionPct: parseFloat(e.target.value) })} className="custom-input" style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Minimum Deposit (₹)</label>
              <input type="number" value={settings.minDepositRs} onChange={(e) => setSettings({ ...settings, minDepositRs: parseFloat(e.target.value) })} className="custom-input" style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Maximum Deposit (₹)</label>
              <input type="number" value={settings.maxDepositRs} onChange={(e) => setSettings({ ...settings, maxDepositRs: parseFloat(e.target.value) })} className="custom-input" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertOctagon size={20} color="#f43f5e" />
              Maintenance & App Version
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: settings.maintenanceMode ? '#f87171' : '#ffffff' }}>Enable Maintenance Mode</span>
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Maintenance Message</label>
              <input type="text" value={settings.maintenanceMessage} onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })} className="custom-input" style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Force Update App Version</label>
              <input type="text" value={settings.forceUpdateVersion} onChange={(e) => setSettings({ ...settings, forceUpdateVersion: e.target.value })} className="custom-input" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          <Save size={20} />
          {saving ? 'Saving Changes...' : 'Save System Settings'}
        </button>
      </form>
    </div>
  );
}
