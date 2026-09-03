'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, Save, RefreshCcw, Layers3, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/services/api';
import LudoLoader from '@/components/common/LudoLoader';
import { PERMISSION_TREE, sanitizePermissions, getRolePermissions, canAccessModule } from '@/lib/rbac';
import { auditService } from '@/lib/audit';

const roleSeed = [
  { id: 'SUPERADMIN', name: 'Super Admin', status: 'ACTIVE', adminCount: 1, permissionCount: 120 },
  { id: 'OPERATIONS_ADMIN', name: 'Operations Admin', status: 'ACTIVE', adminCount: 3, permissionCount: 84 },
  { id: 'FINANCE_MANAGER', name: 'Finance Manager', status: 'ACTIVE', adminCount: 2, permissionCount: 62 },
  { id: 'SUPPORT_MANAGER', name: 'Support Manager', status: 'ACTIVE', adminCount: 2, permissionCount: 41 }
];

export default function RolesPermissionsView() {
  const [roles, setRoles] = useState(roleSeed);
  const [selectedRole, setSelectedRole] = useState('SUPERADMIN');
  const [permissions, setPermissions] = useState(getRolePermissions('SUPERADMIN'));
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/admin/roles');
        if (res.status && res.data?.roles?.length) {
          setRoles(res.data.roles);
          setSelectedRole(res.data.roles[0].id);
          setPermissions(res.data.roles[0].permissions || getRolePermissions(res.data.roles[0].id));
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load role catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const filteredModules = useMemo(() => {
    return Object.entries(PERMISSION_TREE).filter(([moduleKey, config]) => {
      const moduleLabel = config.label.toLowerCase();
      const actionText = (config.actions || []).join(' ').toLowerCase();
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return moduleLabel.includes(query) || actionText.includes(query) || moduleKey.toLowerCase().includes(query);
    });
  }, [search]);

  const selectedRoleMeta = roles.find((role) => role.id === selectedRole) || roles[0] || roleSeed[0];

  const applyRoleTemplate = (roleId) => {
    const nextPermissions = getRolePermissions(roleId);
    setPermissions(nextPermissions);
    setSelectedRole(roleId);
    setError('');
  };

  const handleToggle = (moduleKey, action) => {
    const next = {
      ...permissions,
      [moduleKey]: {
        ...(permissions[moduleKey] || {}),
        [action]: !(permissions[moduleKey]?.[action] ?? false)
      }
    };

    const validated = sanitizePermissions(next);
    setPermissions(validated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const sanitized = sanitizePermissions(permissions);
      const response = await apiFetch('/admin/roles', {
        method: 'POST',
        body: {
          roleId: selectedRole,
          roleName: selectedRoleMeta.name,
          description: selectedRoleMeta.description || 'Dynamic permission set',
          status: selectedRoleMeta.status || 'ACTIVE',
          permissions: sanitized
        }
      });

      if (response.status) {
        auditService.record({
          adminId: 'superadmin',
          action: 'ROLE_PERMISSION_UPDATE',
          targetType: 'role',
          targetId: selectedRole,
          previousState: selectedRoleMeta,
          newState: sanitized,
          reason: 'Updated permission matrix for admin operating role',
          ipAddress: 'local-session',
          deviceInfo: 'web-admin-console'
        });
      }
    } catch (saveError) {
      setError(saveError.message || 'Permission save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LudoLoader text="Loading role matrix and permissions..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>ADMINISTRATOR CONTROL</div>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>Roles & permissions</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => applyRoleTemplate(selectedRole || 'SUPERADMIN')}
            style={{ ...buttonStyle, background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <RefreshCcw size={15} /> Reset role
          </button>
          <button type="button" onClick={handleSave} disabled={saving} style={{ ...buttonStyle, background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#062d1e', fontWeight: 800 }}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save permissions'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => applyRoleTemplate(role.id)}
            style={{
              textAlign: 'left',
              borderRadius: '16px',
              padding: '1rem',
              border: selectedRole === role.id ? '1px solid rgba(16,185,129,0.45)' : '1px solid rgba(255,255,255,0.08)',
              background: selectedRole === role.id ? 'rgba(16,185,129,0.08)' : '#121727',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{role.name}</strong>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>{role.status}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{role.adminCount} admins assigned</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{role.permissionCount} permissions</div>
          </button>
        ))}
      </div>

      <div style={{ background: '#121727', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Selected role</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedRoleMeta.name}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search permissions or module"
              style={{ width: '100%', background: '#0d1527', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.8rem 1rem 0.8rem 2.6rem', color: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" style={smallButtonStyle} onClick={() => setPermissions(sanitizePermissions(getRolePermissions(selectedRole))) }>Select all</button>
            <button type="button" style={smallButtonStyle} onClick={() => setPermissions(createEmptyPermissionSet())}>Deselect all</button>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '0.8rem 1rem', color: '#fca5a5', marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Module</th>
                {['view', 'create', 'edit', 'delete', 'suspend', 'block', 'approve', 'refund', 'export', 'intervene'].map((actionKey) => (
                  <th key={actionKey} style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{actionKey}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredModules.map(([moduleKey, config]) => {
                const modulePermissions = permissions[moduleKey] || {};
                const actions = config.actions || [];
                const hasView = Boolean(modulePermissions.view);

                return (
                  <tr key={moduleKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Layers3 size={15} color={hasView ? '#34d399' : '#64748b'} />
                        {config.label}
                      </div>
                    </td>
                    {['view', 'create', 'edit', 'delete', 'suspend', 'block', 'approve', 'refund', 'export', 'intervene'].map((actionKey) => {
                      const enabled = actions.includes(actionKey) ? Boolean(modulePermissions[actionKey]) : false;
                      return (
                        <td key={`${moduleKey}-${actionKey}`} style={{ padding: '0.5rem 0.4rem' }}>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => actions.includes(actionKey) && handleToggle(moduleKey, actionKey)}
                            disabled={!actions.includes(actionKey)}
                            aria-label={`${config.label} ${actionKey}`}
                            style={{ accentColor: '#10b981', width: '18px', height: '18px', cursor: actions.includes(actionKey) ? 'pointer' : 'not-allowed' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
  padding: '0.8rem 1rem',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f8fafc',
  cursor: 'pointer',
  fontWeight: 700,
  background: 'rgba(255,255,255,0.02)'
};

const smallButtonStyle = {
  ...buttonStyle,
  padding: '0.6rem 0.9rem',
  fontSize: '0.75rem'
};

function createEmptyPermissionSet() {
  const base = {};
  Object.entries(PERMISSION_TREE).forEach(([moduleKey, config]) => {
    base[moduleKey] = {};
    (config.actions || []).forEach((action) => {
      base[moduleKey][action] = false;
    });
  });
  base.dashboard = { view: false };
  return base;
}
