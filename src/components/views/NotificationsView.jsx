'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, MessageSquare, Megaphone, Clock, CheckCircle, RadioTower, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function NotificationsView({ permissions = {} }) {
  if (!hasPermission(permissions, 'notifications.view')) {
    return <AccessDeniedState module="Notifications" permission="notifications.view" />;
  }
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('PROMOTIONAL');
  const [targetAudience, setTargetAudience] = useState('ALL_USERS');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch('/admin/notifications');
      if (res.status && res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      console.error('Fetch notification history error:', e);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      Swal.fire({ title: 'Fields Required', text: 'Enter title and message text', icon: 'warning', background: '#0f1424', color: '#ffffff' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/admin/notifications', 'POST', { title, message, type, targetAudience });
      if (res.status) {
        Swal.fire({ title: 'Broadcast Dispatched!', text: res.message || `Notification dispatched to ${targetAudience}`, icon: 'success', background: '#0f1424', color: '#ffffff' });
        setTitle('');
        setMessage('');
        fetchHistory();
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'Failed to dispatch notification', icon: 'error', background: '#0f1424', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  const miniStats = [
    { label: 'Sent', value: `${history.length || 0}`, icon: <Megaphone size={15} />, color: '#34d399', trend: 'Broadcasts', trendColor: '#34d399' },
    { label: 'Scheduled', value: `${Math.max(history.filter(i => i.status === 'Scheduled').length, 0)}`, icon: <Clock size={15} />, color: '#fbbf24', trend: 'Queued', trendColor: '#fbbf24' },
    { label: 'Delivered', value: `${Math.max(history.filter(i => i.status === 'Delivered').length, 0)}`, icon: <CheckCircle size={15} />, color: '#60a5fa', trend: 'Reached users', trendColor: '#60a5fa' },
    { label: 'Failed', value: `${Math.max(history.filter(i => i.status === 'Failed').length, 0)}`, icon: <RadioTower size={15} />, color: '#f87171', trend: 'Retry required', trendColor: '#f87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="COMMUNICATIONS"
        title="Notification broadcast console"
        subtitle="Create, schedule, and monitor push and in-app messages across every user audience with delivery-level reporting."
        stats={miniStats}
        actions={[
          { label: 'Refresh history', onClick: fetchHistory, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Broadcast Form */}
      <form onSubmit={handleSendNotification} style={{ backgroundColor: '#121727', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Notification Category</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="custom-input">
              <option value="PROMOTIONAL">📢 Promotional / Offer Message</option>
              <option value="MAINTENANCE">⚠️ Maintenance Announcement</option>
              <option value="GAME_UPDATE">🎮 Game & Tournament Notification</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target Audience Segment</label>
            <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="custom-input">
              <option value="ALL_USERS">👥 All Registered Users (28,412)</option>
              <option value="ACTIVE_PLAYERS">⚡ Active Players Today (1,204)</option>
              <option value="HIGH_VALUE">💎 VIP & High Cash Depositors</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Notification Title</label>
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
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Broadcast Message Text</label>
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
            borderRadius: '10px',
            backgroundColor: '#10b981',
            color: '#000000',
            fontWeight: 900,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Send size={18} /> {submitting ? 'Dispatching Broadcast...' : 'Dispatch Broadcast Message'}
        </button>
      </form>

      {/* Broadcast History */}
      <div style={{ backgroundColor: '#121727', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem 0' }}>Recent Broadcast History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.map(item => (
            <div key={item.id} style={{ backgroundColor: '#171e30', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Target: {item.targetAudience} • Sent: {item.sentCount?.toLocaleString('en-IN')} users</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
