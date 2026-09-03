'use client';

import React from 'react';
import { ShieldAlert, ArrowUpRight, Activity } from 'lucide-react';

export function AccessDeniedState({ module = 'Module', permission = 'view' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '360px',
      background: '#121727',
      border: '1px solid rgba(248,113,113,0.18)',
      borderRadius: '20px',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '520px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '18px',
          background: 'rgba(248,113,113,0.12)',
          color: '#fca5a5'
        }}>
          <ShieldAlert size={30} />
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Access restricted</div>
        <h2 style={{ margin: '0.5rem 0 0.75rem', color: '#fff', fontSize: '1.8rem', letterSpacing: '-0.04em' }}>{module} console</h2>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
          This workspace is hidden from your current admin role. Permission required: <strong style={{ color: '#fca5a5' }}>{permission}</strong>.
        </p>
      </div>
    </div>
  );
}

export function ModuleConsoleShell({
  title,
  subtitle,
  badge,
  stats = [],
  actions = [],
  children
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '1.5rem 1.4rem',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.96))',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        boxShadow: '0 18px 38px rgba(2, 6, 23, 0.28)'
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>{badge || 'OPERATIONS'}</div>
          <h2 style={{ margin: '0.45rem 0 0.2rem', color: '#fff', fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{title}</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem' }}>{subtitle}</p>
        </div>

        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                type="button"
                onClick={action.onClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: action.primary ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.02)',
                  color: action.primary ? '#062d1e' : '#f8fafc',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {action.icon || <ArrowUpRight size={15} />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} style={{
              background: '#121727',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.05rem 1rem',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: stat.color || '#94a3b8', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</div>
                {stat.icon || <Activity size={16} />}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>{stat.value}</div>
              <div style={{ marginTop: '6px', color: stat.trendColor || '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>{stat.trend || 'Live metric'}</div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
