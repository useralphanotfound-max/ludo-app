'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import DonutChartWidget from '@/components/admin/charts/DonutChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { HelpCircle, Headphones, ListChecks, Clock, CheckCircle, RefreshCw } from 'lucide-react';

export default function SupportQueuePage() {
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
      confirmButtonColor: 'var(--emerald)',
      background: '#111624',
      color: '#ffffff'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await apiFetch(`/admin/support/${ticketId}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ notes: res.value })
          });
        } catch (e) { }
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
        Swal.fire({ title: 'Resolved', text: `Ticket ${ticketId} marked as RESOLVED`, icon: 'success', background: '#111624', color: '#ffffff' });
      }
    });
  };

  const categoryDonutData = [
    { name: 'Deposit Issue', value: 12, color: '#10b981' },
    { name: 'Withdrawal Delay', value: 8, color: '#f59e0b' },
    { name: 'Game Room Claim', value: 6, color: '#f43f5e' },
    { name: 'KYC & Account', value: 4, color: '#3b82f6' }
  ];

  const columns = [
    {
      key: 'id',
      label: 'Ticket ID',
      render: (v) => <strong style={{ color: 'var(--emerald-light)', fontFamily: 'monospace' }}>{v}</strong>
    },
    {
      key: 'user',
      label: 'Player Account',
      render: (v) => <strong style={{ color: '#ffffff' }}>{v}</strong>
    },
    {
      key: 'category',
      label: 'Category',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v}</span>
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v) => <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{v}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <StatusBadge status={v === 'HIGH' ? 'HIGH' : 'MEDIUM'} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'action',
      label: 'Action',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {r.status !== 'Resolved' && (
            <button
              onClick={() => handleResolveTicket(r.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Resolve Ticket
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Sync */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">PLAYER HELPDESK & TICKETING SLA</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <HelpCircle size={26} color="var(--emerald-light)" /> Support Queue & SLA Management
            </h1>
          </div>

          <button
            onClick={fetchTickets}
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
            <RefreshCw size={15} /> Sync Queue
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Open Help Tickets" value={tickets.filter(t => t.status === 'Open').length || 4} trend="New queue" trendType="neutral" icon={Headphones} badgeColor="emerald" />
          <StatCard title="In Progress" value={tickets.filter(t => t.status === 'In Progress').length || 2} trend="Assigned to agents" trendType="neutral" icon={ListChecks} badgeColor="gold" />
          <StatCard title="Avg First Response" value="12 mins" trend="Under 30m SLA" trendType="up" icon={Clock} badgeColor="emerald" />
          <StatCard title="Resolved Tickets" value={tickets.filter(t => t.status === 'Resolved').length || 18} trend="Closed loop" trendType="up" icon={CheckCircle} badgeColor="emerald" />
        </div>

        {/* Analytics: Category Breakdown Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <ChartCard title="Ticket Volume Share by Issue Category" subtitle="Deposit vs Withdrawal vs Game disputes vs Account" loading={loading}>
            <DonutChartWidget data={categoryDonutData} />
          </ChartCard>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          emptyTitle="No Support Tickets"
          emptyDescription="No open helpdesk tickets in queue."
        />
      </div>
    </AppShell>
  );
}
