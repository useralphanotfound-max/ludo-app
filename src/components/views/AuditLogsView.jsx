import React, { useEffect, useState } from 'react';
import { ShieldCheck, Globe, Clock, UserCheck, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../services/api';

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
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.375rem 0' }}>
            Superadmin IP Audit Trail
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Captures exact IP addresses, login actions, wallet adjustments, and dispute resolutions immutably.
          </p>
        </div>

        <button onClick={fetchLogs} className="btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Stream</span>
        </button>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#090d16', color: '#64748b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Timestamp</th>
              <th style={{ padding: '1rem 1.25rem' }}>Admin Handle</th>
              <th style={{ padding: '1rem 1.25rem' }}>Action Event</th>
              <th style={{ padding: '1rem 1.25rem' }}>Exact IP Address</th>
              <th style={{ padding: '1rem 1.25rem' }}>Audit Details & Target</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Loading Security Logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log._id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 800, color: '#38bdf8' }}>{log.adminUsername}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={log.action === 'ADMIN_LOGIN' ? 'badge-cyan' : 'badge-gold'}>
                      ● {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'monospace' }}>
                      <Globe size={13} />
                      {log.ipAddress || '127.0.0.1'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#e2e8f0', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600 }}>{log.details}</div>
                    {log.targetEntity && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Target: {log.targetEntity}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
