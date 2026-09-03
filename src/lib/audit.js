export function createAuditEntry({
  adminId = 'system',
  action = 'UNKNOWN_ACTION',
  targetType = 'system',
  targetId = 'n/a',
  previousState = null,
  newState = null,
  reason = '',
  ipAddress = 'unknown',
  deviceInfo = 'unknown',
  correlationId = null,
  timestamp = new Date().toISOString()
} = {}) {
  return {
    adminId,
    action,
    targetType,
    targetId,
    previousState,
    newState,
    reason,
    ipAddress,
    deviceInfo,
    correlationId: correlationId || `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp
  };
}

export const auditService = {
  record(entry) {
    const payload = createAuditEntry(entry);
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('royal_admin_audit_log') || '[]');
      history.unshift(payload);
      localStorage.setItem('royal_admin_audit_log', JSON.stringify(history.slice(0, 200)));
    }
    return payload;
  },
  list() {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem('royal_admin_audit_log') || '[]');
    } catch (error) {
      return [];
    }
  }
};
