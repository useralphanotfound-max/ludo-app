'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/admin/layout/AppShell';
import { PERMISSION_TREE, buildAllPermissions, createEmptyPermissionSet, sanitizePermissions } from '@/lib/rbac';
import { KeyRound, Shield, Save, ArrowLeft, Check, X, Layers, CheckSquare, Square } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CreateRolePage() {
  const router = useRouter();

  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [approvalLimitRs, setApprovalLimitRs] = useState(25000);
  const [permissions, setPermissions] = useState(createEmptyPermissionSet());
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleToggleAction = (moduleKey, action) => {
    const next = {
      ...permissions,
      [moduleKey]: {
        ...(permissions[moduleKey] || {}),
        [action]: !(permissions[moduleKey]?.[action] ?? false)
      }
    };
    setPermissions(sanitizePermissions(next));
  };

  const handleSelectAll = () => {
    setPermissions(buildAllPermissions(true));
  };

  const handleClearAll = () => {
    setPermissions(createEmptyPermissionSet());
  };

  const handleSelectReadOnly = () => {
    const readOnly = createEmptyPermissionSet();
    Object.keys(PERMISSION_TREE).forEach(mod => {
      readOnly[mod] = { view: true };
    });
    readOnly.dashboard = { view: true };
    setPermissions(sanitizePermissions(readOnly));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName || !roleId) {
      Swal.fire({ title: 'Fields Required', text: 'Enter Role Name and Role Identifier', icon: 'warning', background: '#111624', color: '#ffffff' });
      return;
    }

    try {
      setSubmitting(true);
      const cleanRoleId = roleId.toUpperCase().replace(/\s+/g, '_');
      
      Swal.fire({
        title: 'Role Template Created!',
        text: `Custom role "${roleName}" (${cleanRoleId}) saved successfully.`,
        icon: 'success',
        background: '#111624',
        color: '#ffffff'
      }).then(() => {
        router.push('/admin/roles');
      });
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'Role creation failed', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredModules = Object.entries(PERMISSION_TREE).filter(([key, config]) => {
    if (!search) return true;
    return config.label.toLowerCase().includes(search.toLowerCase()) || key.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header with Back button & Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/admin/roles')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <ArrowLeft size={18} /> Back to Roles
            </button>
            <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }} />
            <div>
              <div className="micro-label">RBAC CUSTOM ROLE CREATION</div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0 0', letterSpacing: '-0.03em' }}>
                Create Custom Role & Permission Matrix
              </h1>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
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
            <Save size={16} /> {submitting ? 'Creating Role...' : 'Save & Create Custom Role'}
          </button>
        </div>

        {/* Top Form: Role Metadata */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Role Specifications & Limits</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Role Identifier Code (UPPERCASE)</label>
              <input
                type="text"
                placeholder="e.g. SENIOR_RISK_ANALYST"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                className="custom-input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Display Role Name</label>
              <input
                type="text"
                placeholder="e.g. Senior Risk & Fraud Analyst"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="custom-input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Financial Approval Limit (INR ₹)</label>
              <input
                type="number"
                value={approvalLimitRs}
                onChange={(e) => setApprovalLimitRs(parseInt(e.target.value) || 0)}
                className="custom-input"
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Role Purpose & Description</label>
            <input
              type="text"
              placeholder="e.g. Authorized to review anti-cheat alerts, investigate disputes, and approve withdrawals up to ₹50,000."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="custom-input"
            />
          </div>
        </form>

        {/* Permission Matrix Builder Toolbar & Grid */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Configure Module Actions & Scopes</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Toggle individual action permissions for this custom role template.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface-1)', color: 'var(--emerald-light)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleSelectReadOnly}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface-1)', color: 'var(--blue)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Read-Only View All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface-1)', color: 'var(--rose)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search module permissions..."
              className="custom-input"
              style={{ maxWidth: '320px', fontSize: '0.8rem' }}
            />
          </div>

          {/* Module Action Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredModules.map(([moduleKey, config]) => (
              <div key={moduleKey} style={{ padding: '1rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {config.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {Object.values(permissions[moduleKey] || {}).filter(Boolean).length} / {(config.actions || []).length} Enabled
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isAllowed ? 'var(--emerald-bg)' : 'var(--surface-1)',
                          color: isAllowed ? 'var(--emerald-light)' : 'var(--text-muted)',
                          border: isAllowed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          fontWeight: isAllowed ? 700 : 500
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => handleToggleAction(moduleKey, act)}
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
    </AppShell>
  );
}
