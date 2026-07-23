import React from 'react';
import { ShieldCheck, Server, Globe, Cpu } from 'lucide-react';

export default function Header({ admin }) {
  return (
    <header style={{
      height: '68px',
      backgroundColor: '#090d16',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backdropFilter: 'blur(12px)'
    }}>
      {/* System Live Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '0.375rem 0.875rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 10px #10b981'
          }}></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.02em' }}>
            MongoDB Atlas Connected
          </span>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '0.375rem 0.875rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Server size={14} color="#f59e0b" />
          <span>API Base:</span>
          <strong style={{ color: '#f59e0b', fontFamily: 'monospace' }}>http://localhost:3000/api/</strong>
        </div>
      </div>

      {/* Admin Profile Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '0.375rem 0.75rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#60a5fa'
        }}>
          <Globe size={14} />
          <span>IP: <strong>{admin?.lastLoginIp || '127.0.0.1 (Localhost)'}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <img
            src={admin?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin'}
            alt="Superadmin Avatar"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '2px solid #f59e0b',
              backgroundColor: '#0f172a',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)'
            }}
          />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              {admin?.username || 'admin@royalludo.com'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
              ● SUPERADMIN
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
