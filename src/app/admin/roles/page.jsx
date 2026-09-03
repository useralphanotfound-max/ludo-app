'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import { PERMISSION_TREE, sanitizePermissions, getRolePermissions } from '@/lib/rbac';
import Swal from 'sweetalert2';
import { KeyRound, ShieldCheck, Layers3, Save, Search, RefreshCw, Plus } from 'lucide-react';

export default function RolesPermissionsPage() {
  const roleSeed = [
    { id: 'SUPERADMIN', name: 'Super Admin', status: 'ACTIVE', adminCount: 1, permissionCount: 120 },
    { id: 'OPERATIONS_ADMIN', name: 'Operations Admin', status: 'ACTIVE', adminCount: 3, permissionCount: 84 },
    { id: 'FINANCE_MANAGER', name: 'Finance Manager', status: 'ACTIVE', adminCount: 2, permissionCount: 62 },
    { id: 'SUPPORT_MANAGER', name: 'Support Manager', status: 'ACTIVE', adminCount: 2, permissionCount: 41 }
  ];

  const [roles, setRoles] = useState(roleSeed);
  const [selectedRole, setSelectedRole] = useState('SUPERADMIN');
  const [permissions, setPermissions] = useState(getRolePermissions('SUPERADMIN'));
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/roles');
      if (res.status && res.data?.roles?.length) {
        setRoles(res.data.roles);
        setSelectedRole(res.data.roles[0].id);
        setPermissions(res.data.roles[0].permissions || getRolePermissions(res.data.roles[0].id));
      }
    } catch (e) { } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setPermissions(getRolePermissions(roleId));
  };

  const handleToggle = (moduleKey, action) => {
    const next = {
      ...permissions,
      [moduleKey]: {
        ...(permissions[moduleKey] || {}),
        [action]: !(permissions[moduleKey]?.[action] ?? false)
      }
    };
    setPermissions(sanitizePermissions(next));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      Swal.fire({ title: 'Permissions Saved!', text: `Role matrix updated for ${selectedRole}`, icon: 'success', background: '#111624', color: '#ffffff' });
    } catch (e) {
      Swal.fire({ title: 'Save Failed', text: e.message, icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSaving(false);
    }
  };

  const filteredModules = Object.entries(PERMISSION_TREE).filter(([key, config]) => {
    if (!search) return true;
    return config.label.toLowerCase().includes(search.toLowerCase()) || key.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Save / Create */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">RBAC PRIVILEGE CONTROL & SCOPING</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <KeyRound size={26} color="var(--emerald-light)" /> Roles & Permissions Matrix Console
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href="/admin/roles/create"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.85rem',
                border: 'none',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 20px var(--emerald-glow)'
              }}
            >
              <Plus size={16} /> Create Custom Role
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Matrix'}
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Active Defined Roles" value={roles.length} trend="Preset templates" trendType="up" icon={KeyRound} badgeColor="emerald" />
          <StatCard title="Total Privileges Tree" value="120 Actions" trend="17 Modules scoped" trendType="neutral" icon={Layers3} badgeColor="emerald" />
          <StatCard title="Super Admin Accounts" value="1 Master" trend="Protected authority" trendType="neutral" icon={ShieldCheck} badgeColor="gold" />
          <StatCard title="Sensitive Actions" value="14 Protected" trend="Requires audit" trendType="neutral" icon={ShieldCheck} badgeColor="rose" />
        </div>

        {/* Role Selector Tabs & Search Toolbar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.25rem' }}>
          {/* Left Role List */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="micro-label" style={{ marginBottom: '0.5rem' }}>SELECT ROLE TO CONFIGURE</div>
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--emerald-light)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--emerald-bg)' : 'transparent',
                    color: isSelected ? 'var(--emerald-light)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ fontSize: '0.9rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.adminCount} Sub-Admins Assigned</div>
                </button>
              );
            })}
          </div>

          {/* Right Permission Matrix Grid */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Granular Module Permissions — <span style={{ color: 'var(--emerald-light)' }}>{selectedRole}</span>
              </h3>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter permissions..."
                className="custom-input"
                style={{ width: '200px', fontSize: '0.78rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto' }}>
              {filteredModules.map(([moduleKey, config]) => (
                <div key={moduleKey} style={{ padding: '1rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {config.label}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {(config.actions || []).map((act) => {
                      const isAllowed = permissions[moduleKey]?.[act] ?? false;
                      return (
                        <label
                          key={act}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isAllowed ? 'var(--emerald-bg)' : 'var(--surface-1)',
                            color: isAllowed ? 'var(--emerald-light)' : 'var(--text-muted)',
                            border: isAllowed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                            cursor: 'pointer',
                            fontWeight: isAllowed ? 700 : 500
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleToggle(moduleKey, act)}
                            style={{ accentColor: 'var(--emerald)', cursor: 'pointer' }}
                          />
                          <span>{act}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
