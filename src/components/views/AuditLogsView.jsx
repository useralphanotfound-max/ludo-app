'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Shield, Globe, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import LudoLoader from '@/components/common/LudoLoader';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/audit-logs');
      if (res.status) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            Superadmin IP Audit Trail
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Immutable activity stream logging exact IP addresses, superadmin sign-ins, and wallet modifications.
          </p>
        </div>

        <button onClick={fetchLogs} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#818cf8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Timestamp</th>
              <th style={{ padding: '1rem 1.25rem' }}>Superadmin</th>
              <th style={{ padding: '1rem 1.25rem' }}>Action Type</th>
              <th style={{ padding: '1rem 1.25rem' }}>Client IP Address</th>
              <th style={{ padding: '1rem 1.25rem' }}>Details & Context</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem' }}>
                  <LudoLoader text="Loading Superadmin IP Audit Trail Logs..." />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No audit logs recorded yet.</td></tr>
            ) : logs.map(log => (
              <tr key={log._id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {log.adminUsername}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={log.action === 'ADMIN_LOGIN' ? 'badge-cyan' : 'badge-gold'}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, fontFamily: 'monospace' }}>
                    <Globe size={12} />
                    <span>{log.ipAddress}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1', fontSize: '0.8125rem' }}>
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
