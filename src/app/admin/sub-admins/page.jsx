'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { UserCheck, Plus, ShieldCheck, KeyRound, Lock, RefreshCw, Mail } from 'lucide-react';

export default function SubAdminsControlPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'SUPPORT_MANAGER' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/roles');
      if (res.status && res.data?.admins) {
        setAdmins(res.data.admins);
      } else {
        setAdmins([]);
      }
    } catch (e) {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.username || !form.password) return;
    setCreating(true);
    try {
      const res = await apiFetch('/admin/roles', 'POST', form);
      if (res.status || res.success) {
        Swal.fire({ title: 'Admin Created', text: `Account for ${form.username} created successfully.`, icon: 'success', background: '#111624', color: '#fff' });
        setShowCreateModal(false);
        setForm({ email: '', username: '', password: '', role: 'SUPPORT_MANAGER' });
        fetchAdmins();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Create failed', icon: 'error', background: '#111624', color: '#fff' });
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeSessions = async (adminId, username) => {
    const res = await Swal.fire({
      title: `Revoke Sessions for ${username}?`,
      text: 'Sub-admin will be forcibly logged out across all devices.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: 'Revoke All Sessions',
      background: '#111624',
      color: '#ffffff'
    });
    if (res.isConfirmed) {
      try {
        await apiFetch(`/admin/roles/${adminId}/revoke`, 'POST');
        Swal.fire({ title: 'Sessions Revoked', text: `All active tokens invalidated for ${username}`, icon: 'success', background: '#111624', color: '#fff' });
      } catch {}
    }
  };

  const activeCount = admins.filter(a => a.status === 'ACTIVE').length;

  const columns = [
    {
      key: 'username',
      label: 'Admin Account',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff' }}>{v}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.email || r.id}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Assigned Role',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v ? new Date(v).toLocaleDateString() : '—'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v || 'ACTIVE'} />
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <button
          onClick={() => handleRevokeSessions(r._id || r.id, r.username)}
          className="btn btn-danger"
        >
          Revoke Sessions
        </button>
      )
    }
  ];

  return (
    <AppShell>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <div className="micro-label">SUB-ADMIN DELEGATION &amp; ACCESS CONTROL</div>
            <h1 className="admin-page-title">
              <UserCheck size={24} color="var(--emerald-light)" /> Sub-Admin Control Center
            </h1>
          </div>

          <div className="admin-header-actions">
            <button onClick={fetchAdmins} className="btn btn-ghost"><RefreshCw size={14} /> Refresh</button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={15} /> Add Sub-Admin
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid-auto">
          <StatCard title="Total Sub-Admins" value={admins.length} trend="In database" trendType="neutral" icon={UserCheck} badgeColor="emerald" />
          <StatCard title="Active Accounts" value={activeCount} trend="With active sessions" trendType="up" icon={ShieldCheck} badgeColor="emerald" />
          <StatCard title="Locked Accounts" value={admins.filter(a => a.status === 'LOCKED' || a.status === 'SUSPENDED').length} trend="Require action" trendType="down" icon={Lock} badgeColor="rose" />
          <StatCard title="Roles Configured" value={[...new Set(admins.map(a => a.role))].length} trend="Distinct roles" trendType="neutral" icon={KeyRound} badgeColor="gold" />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={admins}
          loading={loading}
          emptyTitle="No Sub-Admin Accounts"
          emptyDescription="No sub-admin accounts configured yet. Create one to get started."
        />

        {/* Create Modal */}
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#fff' }}>Create Sub-Admin Account</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', minHeight: 0 }}>✕</button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Username</label>
                  <input className="custom-input" type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="e.g. support_ravi" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Email</label>
                  <input className="custom-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="admin@royalludo.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Password</label>
                  <input className="custom-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 characters" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Role</label>
                  <select className="custom-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="SUPPORT_MANAGER">Support Manager</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                    <option value="OPERATIONS_ADMIN">Operations Admin</option>
                    <option value="CONTENT_MANAGER">Content Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>{creating ? 'Creating...' : 'Create Account'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
