'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import DonutChartWidget from '@/components/admin/charts/DonutChartWidget';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { Bell, Send, Megaphone, Clock, CheckCircle, RadioTower, RefreshCw } from 'lucide-react';

export default function NotificationBroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('PROMOTIONAL');
  const [targetAudience, setTargetAudience] = useState('ALL_USERS');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/notifications');
      if (res.status && res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      console.error('Fetch notification history error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      Swal.fire({ title: 'Fields Required', text: 'Enter broadcast title and message text', icon: 'warning', background: '#111624', color: '#ffffff' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/admin/notifications', 'POST', { title, message, type, targetAudience });
      if (res.status) {
        Swal.fire({ title: 'Broadcast Dispatched!', text: res.message || `Push notification sent to ${targetAudience}`, icon: 'success', background: '#111624', color: '#ffffff' });
        setTitle('');
        setMessage('');
        fetchHistory();
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'Failed to dispatch notification', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  const audienceDonutData = [
    { name: 'All Registered Players (28.4k)', value: 28412, color: '#10b981' },
    { name: 'Active Players Today (1.2k)', value: 1204, color: '#3b82f6' },
    { name: 'VIP Depositors (140)', value: 140, color: '#f59e0b' }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">BROADCAST & PUSH ENGAGEMENT</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <Bell size={26} color="var(--emerald-light)" /> Notification Broadcast Center
            </h1>
          </div>

          <button
            onClick={fetchHistory}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={15} /> Refresh History
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Sent Broadcasts" value={history.length || 14} trend="Targeted pushes" trendType="up" icon={Megaphone} badgeColor="emerald" />
          <StatCard title="Delivery Success Rate" value="99.2%" trend="Push Service active" trendType="up" icon={CheckCircle} badgeColor="emerald" />
          <StatCard title="Scheduled Pushes" value="2 Queued" trend="Next at 20:00 IST" trendType="neutral" icon={Clock} badgeColor="gold" />
          <StatCard title="Push Errors" value="0 Failed" trend="Zero push drops" trendType="neutral" icon={RadioTower} badgeColor="rose" />
        </div>

        {/* Analytics: Audience Breakdown & Compose Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
          <ChartCard title="Audience Segment Reach" subtitle="Player breakdown across push targets" loading={loading}>
            <DonutChartWidget data={audienceDonutData} />
          </ChartCard>

          <form onSubmit={handleSendNotification} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Compose New Push Broadcast</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Notification Category</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="custom-input">
                  <option value="PROMOTIONAL">📢 Promotional / Deposit Offer</option>
                  <option value="MAINTENANCE">⚠️ Scheduled Maintenance Announcement</option>
                  <option value="GAME_UPDATE">🎮 Tournament & Game Update</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Target Audience Segment</label>
                <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="custom-input">
                  <option value="ALL_USERS">👥 All Registered Players (28,412)</option>
                  <option value="ACTIVE_PLAYERS">⚡ Active Players Today (1,204)</option>
                  <option value="HIGH_VALUE">💎 VIP & High Cash Depositors</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🏆 Weekend Mega Tournament ₹100,000 Guarantee!"
                className="custom-input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Broadcast Message Text</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification body text..."
                className="custom-input"
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 20px var(--emerald-glow)'
              }}
            >
              <Send size={18} /> {submitting ? 'Dispatching Broadcast...' : 'Dispatch Push Broadcast'}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Recent Broadcast History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((item) => (
              <div key={item.id} style={{ backgroundColor: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Target: {item.targetAudience} • Sent: {(item.sentCount || 28412).toLocaleString('en-IN')} users</div>
                </div>
                <StatusBadge status={item.status || 'SUCCESS'} text="DELIVERED" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
