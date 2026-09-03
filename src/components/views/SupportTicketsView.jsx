'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, RefreshCw, MessageSquare, Clock, CheckCircle, AlertCircle, Headphones, ListChecks } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function SupportTicketsView({ permissions = {} }) {
  if (!hasPermission(permissions, 'support.view')) {
    return <AccessDeniedState module="Support" permission="support.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/support');
      if (res.status && res.data) {
        setTickets(res.data);
      }
    } catch (e) {
      console.error('Fetch support tickets error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = (ticketId) => {
    Swal.fire({
      title: 'Resolve Support Ticket?',
      input: 'textarea',
      inputPlaceholder: 'Enter resolution notes for user...',
      showCancelButton: true,
      confirmButtonText: 'Resolve & Close Ticket',
      confirmButtonColor: '#10b981',
      background: '#0f1424',
      color: '#ffffff'
    }).then((res) => {
      if (res.isConfirmed) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
        Swal.fire({ title: 'Resolved', text: `Ticket ${ticketId} marked as RESOLVED`, icon: 'success', background: '#0f1424', color: '#ffffff' });
      }
    });
  };

  const miniStats = [
    { label: 'Open', value: `${tickets.filter(t => t.status === 'Open').length || 0}`, icon: <Headphones size={15} />, color: '#60a5fa', trend: 'New queue', trendColor: '#60a5fa' },
    { label: 'In progress', value: `${tickets.filter(t => t.status === 'In Progress').length || 0}`, icon: <ListChecks size={15} />, color: '#fbbf24', trend: 'Assigned', trendColor: '#fbbf24' },
    { label: 'Waiting for user', value: `${tickets.filter(t => t.status === 'Waiting for User').length || 0}`, icon: <Clock size={15} />, color: '#f59e0b', trend: 'Pending reply', trendColor: '#f59e0b' },
    { label: 'Resolved', value: `${tickets.filter(t => t.status === 'Resolved').length || 0}`, icon: <CheckCircle size={15} />, color: '#34d399', trend: 'Closed loop', trendColor: '#34d399' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="HELP & SUPPORT"
        title="Support queue console"
        subtitle="Customer-service lifecycle management across assignments, responses, resolutions, and user follow-up."
        stats={miniStats}
        actions={[
          { label: 'Sync support', onClick: fetchTickets, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Tickets Table */}
      <div style={{ backgroundColor: '#121727', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#171e30', color: '#64748b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem' }}>Ticket ID</th>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Subject</th>
              <th style={{ padding: '1rem' }}>Priority</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
                  Fetching Live Support Tickets Queue...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No open support tickets.
                </td>
              </tr>
            ) : (
              tickets.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#10b981' }}>
                    {t.id}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    {t.user}
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                    {t.category}
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8' }}>
                    {t.subject}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: t.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: t.priority === 'HIGH' ? '#f87171' : '#facc15' }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: t.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(96, 165, 250, 0.2)', color: t.status === 'Resolved' ? '#34d399' : '#60a5fa' }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.status !== 'Resolved' && (
                      <button onClick={() => handleResolveTicket(t.id)} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: '#000000', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
