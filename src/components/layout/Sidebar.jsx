import React from 'react';
import { LayoutDashboard, Users, ArrowUpRight, ShieldAlert, Settings, FileText, LogOut, Crown, ChevronRight } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'Users & Wallets', icon: Users, badge: null },
    { id: 'withdrawals', label: 'Withdrawal Queue', icon: ArrowUpRight, badge: 'Net 100%' },
    { id: 'disputes', label: 'Match Disputes', icon: ShieldAlert, badge: 'Live Review' },
    { id: 'settings', label: 'Game Settings', icon: Settings, badge: null },
    { id: 'logs', label: 'IP Audit Trail', icon: FileText, badge: 'Security' },
  ];

  return (
    <aside style={{
      width: '270px',
      backgroundColor: '#090d16',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.4)'
        }}>
          <Crown size={26} color="#060913" />
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Royal Ludo
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginTop: '2px', letterSpacing: '0.04em' }}>
            SUPERADMIN PORTAL
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '1.25rem 0.875rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem', paddingLeft: '0.625rem' }}>
          Main Navigation
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.875rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                color: isActive ? '#f59e0b' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                marginBottom: '0.375rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <Icon size={20} color={isActive ? '#f59e0b' : '#64748b'} />
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </div>

              {item.badge ? (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#fef08a' : '#64748b'
                }}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight size={16} color="#f59e0b" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: '#060913' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            padding: '0.75rem',
            borderRadius: '10px',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            color: '#f87171',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
