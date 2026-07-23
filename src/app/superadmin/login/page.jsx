'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, KeyRound, Sparkles, AlertCircle, Globe, ShieldCheck } from 'lucide-react';
import { showSuccess, showError } from '@/lib/swal';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin@royalludo.com');
  const [password, setPassword] = useState('RoyalAdmin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillQuickDemo = () => {
    setUsername('admin@royalludo.com');
    setPassword('RoyalAdmin@123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      showError('Validation Error', 'Please enter superadmin handle and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
      const data = await res.json();

      if (res.ok && data.status && data.data?.token) {
        localStorage.setItem('royal_admin_token', data.data.token);
        localStorage.setItem('royal_admin_user', JSON.stringify(data.data.admin));

        await showSuccess('Authenticated Successfully!', 'Welcome back to Royal Ludo Superadmin Console.');
        router.push('/superadmin/dashboard');
      } else {
        const errorMsg = data.message || 'Superadmin authentication failed';
        setError(errorMsg);
        showError('Login Failed', errorMsg);
      }
    } catch (err) {
      const errMsg = 'Superadmin authentication failed (Server connection error)';
      setError(errMsg);
      showError('Connection Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060913',
      backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(245, 158, 11, 0.18), rgba(255, 255, 255, 0))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(13, 19, 34, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)'
      }}>
        {/* Official Royal Ludo Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '24px',
            boxShadow: '0 12px 32px -6px rgba(245, 158, 11, 0.5)',
            marginBottom: '1.25rem',
            overflow: 'hidden',
            border: '2px solid rgba(245, 158, 11, 0.6)'
          }}>
            <img
              src="/logo.png"
              alt="Royal Ludo Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>
            Royal Ludo
          </h1>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            letterSpacing: '0.05em'
          }}>
            SUPERADMIN PORTAL
          </span>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f87171',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Superadmin Handle / Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="custom-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                placeholder="admin@royalludo.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="custom-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginBottom: '1rem' }}
          >
            <Sparkles size={20} />
            {loading ? 'Authenticating...' : 'Sign In to Superadmin'}
          </button>
        </form>

        <button
          type="button"
          onClick={fillQuickDemo}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', fontSize: '0.8125rem' }}
        >
          <ShieldCheck size={16} color="#f59e0b" />
          <span>Auto-fill Superadmin Credentials</span>
        </button>

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: '#64748b',
          fontSize: '0.75rem'
        }}>
          <Globe size={14} color="#10b981" />
          <span>Audit Security Active: Exact IP address logged upon sign-in</span>
        </div>
      </div>
    </div>
  );
}
