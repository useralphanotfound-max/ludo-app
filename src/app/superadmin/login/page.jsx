'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SuperadminLoginPage() {
  const [username, setUsername] = useState('admin@royalludo.com');
  const [password, setPassword] = useState('RoyalAdmin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.status && data.data?.token) {
        localStorage.setItem('royal_admin_token', data.data.token);
        localStorage.setItem('royal_admin_user', JSON.stringify(data.data.admin));
        document.cookie = `royal_admin_token=${data.data.token}; path=/; max-age=2592000; SameSite=Lax`;

        window.location.replace('/superadmin/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0c16',
      backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(250, 204, 21, 0.2), rgba(255, 255, 255, 0))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(19, 25, 46, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(250, 204, 21, 0.45)',
        borderRadius: '28px',
        padding: '2.5rem',
        boxShadow: '0 25px 65px -15px rgba(0, 0, 0, 0.95)'
      }}>
        {/* Logo & App Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '24px',
            boxShadow: '0 12px 36px -6px rgba(250, 204, 21, 0.55)',
            marginBottom: '1rem',
            overflow: 'hidden',
            border: '2.5px solid rgba(250, 204, 21, 0.7)'
          }}>
            <img
              src="/logo.png"
              alt="Royal Ludo Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.25rem 0', fontFamily: "'Outfit', system-ui, sans-serif" }}>
            Royal Ludo
          </h1>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#facc15', margin: 0 }}>
            Super Admin Login
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@royalludo.com"
              required
              style={{
                width: '100%',
                backgroundColor: '#0d1527',
                border: '1.5px solid rgba(250, 204, 21, 0.4)',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0d1527',
                  border: '1.5px solid rgba(250, 204, 21, 0.4)',
                  borderRadius: '14px',
                  padding: '0.85rem 3rem 0.85rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.2s'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} color="#facc15" /> : <Eye size={20} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              borderRadius: '14px'
            }}
          >
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
