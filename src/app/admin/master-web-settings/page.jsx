'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import { Power, Eye, EyeOff, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SecretMasterWebSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isWebGameEnabled, setIsWebGameEnabled] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchWebStatus();
  }, []);

  const fetchWebStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/master-web-settings?t=' + Date.now());
      const data = await res.json();
      if (data.status && data.data) {
        setIsWebGameEnabled(data.data.isWebGameEnabled !== false);
      }
    } catch (e) {
      console.error('Fetch status error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (newState) => {
    const actionText = newState ? 'ENABLE Web Game App' : 'DISABLE Web Game App (Show 404 Page)';
    const confirm = await Swal.fire({
      title: `${actionText}?`,
      text: newState
        ? 'The web game will become publicly accessible on the website home page.'
        : 'The web game will be HIDDEN completely! Anyone visiting the main website will see a 404 Not Found page.',
      icon: newState ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: newState ? 'var(--emerald)' : 'var(--rose)',
      confirmButtonText: newState ? 'Yes, Enable Game' : 'Yes, Hide & Show 404',
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      setUpdating(true);
      const res = await fetch('/api/admin/master-web-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWebGameEnabled: newState })
      });
      const data = await res.json();
      if (data.status) {
        setIsWebGameEnabled(newState);
        Swal.fire({
          title: newState ? 'Web Game Enabled' : 'Web Game Hidden (404 Active)',
          text: data.message,
          icon: 'success',
          background: '#111624',
          color: '#ffffff'
        });
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (e) {
      Swal.fire({
        title: 'Error',
        text: e.message || 'Operation failed',
        icon: 'error',
        background: '#111624',
        color: '#ffffff'
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div>
          <div className="micro-label" style={{ color: 'var(--gold)' }}>SECRET MASTER CONTROL</div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: '6px 0 4px 0', letterSpacing: '-0.03em' }}>
            Master Web Settings & Visibility Toggle
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            This page is hidden from standard admin navigation. Use this master switch to show or hide the web application completely.
          </p>
        </div>

        {/* Master Status Card */}
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: `2px solid ${isWebGameEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
            backgroundColor: isWebGameEnabled ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: isWebGameEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isWebGameEnabled ? 'var(--emerald)' : 'var(--rose)'
                }}
              >
                {isWebGameEnabled ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Current Website Status
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isWebGameEnabled ? 'var(--emerald)' : 'var(--rose)' }}>
                  {isWebGameEnabled ? 'ONLINE / GAME VISIBLE' : 'OFFLINE / 404 PAGE ACTIVE'}
                </div>
              </div>
            </div>

            {/* Toggle Action Button */}
            <button
              disabled={updating || loading}
              onClick={() => handleToggle(!isWebGameEnabled)}
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 900,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: isWebGameEnabled ? 'var(--rose)' : 'var(--emerald)',
                color: isWebGameEnabled ? '#ffffff' : '#000000',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                opacity: updating ? 0.6 : 1
              }}
            >
              <Power size={20} />
              {updating ? 'Updating Status...' : (isWebGameEnabled ? 'Disable Game (Show 404)' : 'Enable Game (Show App)')}
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

          {/* Details & Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Eye size={16} style={{ color: 'var(--emerald)' }} /> Enable Mode
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                When Enabled, users visiting <code>/</code> will see the Royal Ludo web application and can register, log in, and play games.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <EyeOff size={16} style={{ color: 'var(--rose)' }} /> Disable Mode (404)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                When Disabled, opening the website <code>/</code> immediately triggers Next.js built-in <strong>404 | This page could not be found</strong> screen.
              </p>
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
