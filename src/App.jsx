import React, { useState, useEffect } from 'react';
import AdminLoginView from './components/views/AdminLoginView';
import DashboardView from './components/views/DashboardView';
import UserManagementView from './components/views/UserManagementView';
import WithdrawalsView from './components/views/WithdrawalsView';
import DisputesView from './components/views/DisputesView';
import GameSettingsView from './components/views/GameSettingsView';
import AuditLogsView from './components/views/AuditLogsView';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Check stored token
    const token = localStorage.getItem('royal_admin_token');
    const storedUser = localStorage.getItem('royal_admin_user');
    if (token && storedUser) {
      try {
        setAdmin(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('royal_admin_token');
      }
    }

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData);
    window.history.pushState({}, '', '/superadmin/dashboard');
    setCurrentPath('/superadmin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_admin_token');
    localStorage.removeItem('royal_admin_user');
    setAdmin(null);
    window.history.pushState({}, '', '/superadmin/login');
    setCurrentPath('/superadmin/login');
  };

  // Route check for /superadmin/login
  if (!admin || currentPath === '/superadmin/login') {
    return <AdminLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header admin={admin} />

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'withdrawals' && <WithdrawalsView />}
          {activeTab === 'disputes' && <DisputesView />}
          {activeTab === 'settings' && <GameSettingsView />}
          {activeTab === 'logs' && <AuditLogsView />}
        </main>
      </div>
    </div>
  );
}
