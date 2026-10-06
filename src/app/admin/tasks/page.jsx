'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ClipboardList, Plus, Trash2, Edit3, CheckCircle2, XCircle, RefreshCw, Trophy, Target, Gift } from 'lucide-react';

export default function AdminTasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'PLAY_MATCHES',
    target: 5,
    reward: 20,
    rewardType: 'bonus',
    minEntryFee: 50,
    isActive: true
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/tasks');
      if (res.success && res.data?.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (e) {
      console.error('Fetch tasks error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      taskType: 'PLAY_MATCHES',
      target: 5,
      reward: 20,
      rewardType: 'bonus',
      minEntryFee: 50,
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      taskType: task.taskType || 'PLAY_MATCHES',
      target: task.target || 1,
      reward: task.reward || 10,
      rewardType: task.rewardType || 'bonus',
      minEntryFee: task.minEntryFee || 0,
      isActive: task.isActive !== false
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const id = editingTask.taskId || editingTask._id;
        const res = await apiFetch(`/admin/tasks/${id}`, 'PUT', formData);
        if (res.success) {
          Swal.fire({ title: 'Task Updated!', icon: 'success', background: '#111624', color: '#ffffff' });
          setShowModal(false);
          fetchTasks();
        }
      } else {
        const res = await apiFetch('/admin/tasks', 'POST', formData);
        if (res.success) {
          Swal.fire({ title: 'Task Created!', icon: 'success', background: '#111624', color: '#ffffff' });
          setShowModal(false);
          fetchTasks();
        }
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'Operation failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const handleDelete = (task) => {
    const id = task.taskId || task._id;
    Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${task.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#f43f5e',
      background: '#111624',
      color: '#ffffff'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const apiRes = await apiFetch(`/admin/tasks/${id}`, 'DELETE');
          if (apiRes.success) {
            Swal.fire({ title: 'Deleted', text: 'Task deleted successfully', icon: 'success', background: '#111624', color: '#ffffff' });
            fetchTasks();
          }
        } catch (err) {
          Swal.fire({ title: 'Delete Failed', text: err.message, icon: 'error', background: '#111624', color: '#ffffff' });
        }
      }
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Task Details',
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{r.title}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.description}</span>
        </div>
      )
    },
    {
      key: 'taskType',
      label: 'Mission Type',
      render: (v) => <span style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: '0.8rem' }}>{v}</span>
    },
    {
      key: 'target',
      label: 'Target Goal',
      render: (v, r) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          {v} {r.taskType?.includes('MATCH') ? 'Matches' : 'Action'}
        </span>
      )
    },
    {
      key: 'reward',
      label: 'Reward',
      render: (v, r) => (
        <strong style={{ color: 'var(--emerald-light)', fontSize: '0.9rem' }}>
          ₹{v} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({r.rewardType?.toUpperCase()})</span>
        </strong>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => <StatusBadge status={v ? 'ACTIVE' : 'SUSPENDED'} text={v ? 'ENABLED' : 'DISABLED'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleOpenEdit(r)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <Edit3 size={13} /> Edit
          </button>
          <button
            onClick={() => handleDelete(r)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--rose)',
              color: 'var(--rose)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">DAILY MISSIONS & RETENTION ENGINE</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <ClipboardList size={26} color="var(--emerald-light)" /> Tasks & Daily Missions Management
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchTasks}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={handleOpenCreate}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 20px var(--emerald-glow)'
              }}
            >
              <Plus size={16} /> Create New Task
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Defined Tasks" value={tasks.length} trend="Active in system" trendType="neutral" icon={ClipboardList} badgeColor="emerald" />
          <StatCard title="Active Enabled Tasks" value={tasks.filter(t => t.isActive !== false).length} trend="Live for players" trendType="up" icon={CheckCircle2} badgeColor="emerald" />
          <StatCard title="Avg Task Reward" value={`₹${Math.round(tasks.reduce((a, b) => a + (b.reward || 0), 0) / (tasks.length || 1))}`} trend="Per claim" trendType="neutral" icon={Gift} badgeColor="gold" />
          <StatCard title="Task Reset Cycle" value="Daily Midnight" trend="00:00 UTC" trendType="neutral" icon={Target} badgeColor="emerald" />
        </div>

        {/* Tasks Data Table */}
        <DataTable
          columns={columns}
          data={tasks}
          loading={loading}
          emptyTitle="No Daily Tasks Configured"
          emptyDescription="Click 'Create New Task' to define daily missions and bonus rewards for players."
        />

        {/* Create / Edit Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', color: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                  {editingTask ? 'Edit Mission Task' : 'Create New Mission Task'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Task Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Play 5 Classic Matches"
                    className="custom-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Complete 5 matches of ₹50 or above"
                    className="custom-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Mission Type</label>
                    <select
                      value={formData.taskType}
                      onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                      className="custom-input"
                    >
                      <option value="PLAY_MATCHES">PLAY_MATCHES</option>
                      <option value="WIN_MATCHES">WIN_MATCHES</option>
                      <option value="DEPOSIT_CASH">DEPOSIT_CASH</option>
                      <option value="INVITE_FRIENDS">INVITE_FRIENDS</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Target Goal Count</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                      className="custom-input"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Reward Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.reward}
                      onChange={(e) => setFormData({ ...formData, reward: Number(e.target.value) })}
                      className="custom-input"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Reward Wallet Type</label>
                    <select
                      value={formData.rewardType}
                      onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                      className="custom-input"
                    >
                      <option value="bonus">Bonus Balance</option>
                      <option value="deposit">Deposit Balance</option>
                      <option value="winning">Winning Balance</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="taskActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ accentColor: 'var(--emerald)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="taskActiveCheck" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Task Enabled & Active in App</label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--emerald)', color: '#000000', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                  >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
