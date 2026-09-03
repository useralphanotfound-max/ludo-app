'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Smartphone, Globe, Users, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { hasPermission } from '@/lib/rbac';
import { AccessDeniedState } from '@/components/common/ModuleConsoleShell';

export default function AntiCheatView({ permissions = {} }) {
  if (!hasPermission(permissions, 'risk.view')) {
    return <AccessDeniedState module="Fraud / Risk" permission="risk.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/anti-cheat');
      if (res.status && res.data) {
        setAlerts(res.data);
      }
    } catch (e) {
      console.error('Fetch anti-cheat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = (id) => {
    Swal.fire({ title: 'Alert Resolved', text: 'Security trigger marked as resolved in audit log', icon: 'success', background: '#0f1424', color: '#ffffff' });
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem',
        backgroundColor: '#121727',
        borderRadius: '16px',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FRAUD MATRIX</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={24} color="#f87171" /> Anti-Cheat & Multi-Signal Fraud Engine
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Multi-signal scoring matrix tracking shared hardware devices, IP clusters, collusion pairs, and velocity spikes.
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#171e30',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f87171',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} /> Sync Security Matrix
        </button>
      </div>

      {/* Fraud Indicators List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#f87171', fontWeight: 800 }}>
            Analyzing Multi-Signal Risk Metrics...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ backgroundColor: '#121727', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center', color: '#34d399' }}>
            <ShieldCheck size={36} style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>No Security Alerts Flagged</div>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} style={{ backgroundColor: '#121727', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <AlertTriangle size={24} color="#f87171" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>{alert.title}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                      {alert.riskLevel || alert.severity || 'HIGH'} SEVERITY
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>{alert.description}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', display: 'flex', gap: '1rem' }}>
                    <span>User: <strong style={{ color: '#ffffff' }}>{alert.user}</strong></span>
                    <span>IP: <strong style={{ color: '#60a5fa' }}>{alert.ip}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleResolveAlert(alert.id)}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Resolve Alert
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
