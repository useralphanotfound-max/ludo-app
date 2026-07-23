import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertTriangle, ToggleLeft, ToggleRight, ShieldAlert, Sliders } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function GameSettingsView() {
  const [settings, setSettings] = useState({
    platformCommissionPct: 10,
    minDepositRs: 50,
    maxDepositRs: 50000,
    minWithdrawRs: 100,
    maxWithdrawRs: 25000,
    maintenanceMode: false,
    maintenanceMessage: 'Royal Ludo is undergoing scheduled maintenance.',
    forceUpdateVersion: '1.0.0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    setMessage('');
    try {
      const res = await apiFetch('/admin/settings', 'PUT', settings);
      if (res.status) {
        setMessage('✅ System game settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>Loading System Settings...</div>;
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
          Platform Game Settings
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Configure financial rules, platform commission %, deposit/withdrawal bounds, and emergency maintenance mode.
        </p>
      </div>

      {message && (
        <div style={{ padding: '0.875rem 1.25rem', borderRadius: '12px', backgroundColor: '#090d16', color: '#f59e0b', fontSize: '0.875rem', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Financial Rules */}
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Sliders size={20} color="#f59e0b" />
            Financial & Commission Rules
          </h2>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Platform Commission Percentage (%)
            </label>
            <input
              type="number"
              value={settings.platformCommissionPct}
              onChange={(e) => setSettings({ ...settings, platformCommissionPct: parseFloat(e.target.value) })}
              className="custom-input"
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Deducted from match prize pool (e.g., 10% on ₹1,000 entry fee = ₹100 platform fee)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Min Deposit (₹)
              </label>
              <input
                type="number"
                value={settings.minDepositRs}
                onChange={(e) => setSettings({ ...settings, minDepositRs: parseInt(e.target.value) })}
                className="custom-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Max Deposit (₹)
              </label>
              <input
                type="number"
                value={settings.maxDepositRs}
                onChange={(e) => setSettings({ ...settings, maxDepositRs: parseInt(e.target.value) })}
                className="custom-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Min Withdrawal (₹)
              </label>
              <input
                type="number"
                value={settings.minWithdrawRs}
                onChange={(e) => setSettings({ ...settings, minWithdrawRs: parseInt(e.target.value) })}
                className="custom-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Max Withdrawal (₹)
              </label>
              <input
                type="number"
                value={settings.maxWithdrawRs}
                onChange={(e) => setSettings({ ...settings, maxWithdrawRs: parseInt(e.target.value) })}
                className="custom-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Maintenance & App Control */}
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.75rem', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShieldAlert size={20} color="#f43f5e" />
            System Maintenance & App Version Control
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff' }}>Maintenance Mode Switch</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Block mobile app logins & match creations during updates</div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={settings.maintenanceMode ? 'btn-danger' : 'btn-secondary'}
            >
              {settings.maintenanceMode ? '🚨 BLOCKING APP LOGINS' : '✅ NORMAL SYSTEM'}
            </button>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Maintenance Announcement Message
            </label>
            <input
              type="text"
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              className="custom-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Force Update Minimum Version
            </label>
            <input
              type="text"
              value={settings.forceUpdateVersion}
              onChange={(e) => setSettings({ ...settings, forceUpdateVersion: e.target.value })}
              className="custom-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.75rem 2.25rem', fontSize: '1rem' }}>
          <Save size={18} /> {saving ? 'Saving Config...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
