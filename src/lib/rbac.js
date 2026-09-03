export const PERMISSION_TREE = {
  dashboard: {
    label: 'Dashboard',
    actions: ['view'],
    protected: false,
    dependencies: { view: [] }
  },
  users: {
    label: 'Users',
    actions: ['view', 'create', 'edit', 'delete', 'suspend', 'block', 'unblock', 'view_sensitive', 'view_wallet', 'view_transactions', 'view_games', 'view_login_history'],
    protected: false,
    dependencies: {
      view: [],
      create: ['view'],
      edit: ['view'],
      delete: ['view'],
      suspend: ['view'],
      block: ['view'],
      unblock: ['view'],
      view_sensitive: ['view'],
      view_wallet: ['view'],
      view_transactions: ['view'],
      view_games: ['view'],
      view_login_history: ['view']
    }
  },
  wallets: {
    label: 'Wallets',
    actions: ['view', 'deposit', 'withdraw', 'refund', 'bonus', 'freeze', 'unfreeze', 'adjust'],
    protected: false,
    dependencies: {
      view: [],
      deposit: ['view'],
      withdraw: ['view'],
      refund: ['view'],
      bonus: ['view'],
      freeze: ['view'],
      unfreeze: ['view'],
      adjust: ['view']
    }
  },
  deposits: {
    label: 'Deposits',
    actions: ['view', 'approve', 'reject', 'refund', 'reconcile'],
    protected: false,
    dependencies: {
      view: [],
      approve: ['view'],
      reject: ['view'],
      refund: ['view'],
      reconcile: ['view']
    }
  },
  withdrawals: {
    label: 'Withdrawals',
    actions: ['view', 'approve', 'reject', 'process', 'refund', 'reverse'],
    protected: false,
    dependencies: {
      view: [],
      approve: ['view'],
      reject: ['view'],
      process: ['view'],
      refund: ['view'],
      reverse: ['view']
    }
  },
  transactions: {
    label: 'Transactions',
    actions: ['view', 'export', 'refund'],
    protected: false,
    dependencies: {
      view: [],
      export: ['view'],
      refund: ['view']
    }
  },
  games: {
    label: 'Games',
    actions: ['view', 'create', 'edit', 'delete', 'intervene', 'cancel', 'refund'],
    protected: false,
    dependencies: {
      view: [],
      create: ['view'],
      edit: ['view'],
      delete: ['view'],
      intervene: ['view'],
      cancel: ['view'],
      refund: ['view']
    }
  },
  'live-games': {
    label: 'Live Games',
    actions: ['view', 'intervene', 'cancel', 'monitor'],
    protected: false,
    dependencies: {
      view: [],
      intervene: ['view'],
      cancel: ['view'],
      monitor: ['view']
    }
  },
  disputes: {
    label: 'Disputes',
    actions: ['view', 'approve', 'reject', 'refund', 'escalate', 'request_evidence'],
    protected: false,
    dependencies: {
      view: [],
      approve: ['view'],
      reject: ['view'],
      refund: ['view'],
      escalate: ['view'],
      request_evidence: ['view']
    }
  },
  'risk': {
    label: 'Fraud / Risk',
    actions: ['view', 'investigate', 'flag', 'escalate', 'suspend', 'block'],
    protected: false,
    dependencies: {
      view: [],
      investigate: ['view'],
      flag: ['view'],
      escalate: ['view'],
      suspend: ['view'],
      block: ['view']
    }
  },
  referrals: {
    label: 'Referrals',
    actions: ['view', 'create', 'edit', 'reward', 'freeze', 'investigate'],
    protected: false,
    dependencies: {
      view: [],
      create: ['view'],
      edit: ['view'],
      reward: ['view'],
      freeze: ['view'],
      investigate: ['view']
    }
  },
  notifications: {
    label: 'Notifications',
    actions: ['view', 'create', 'edit', 'delete', 'send', 'schedule'],
    protected: false,
    dependencies: {
      view: [],
      create: ['view'],
      edit: ['view'],
      delete: ['view'],
      send: ['view'],
      schedule: ['view']
    }
  },
  support: {
    label: 'Support',
    actions: ['view', 'assign', 'respond', 'resolve', 'escalate'],
    protected: false,
    dependencies: {
      view: [],
      assign: ['view'],
      respond: ['view'],
      resolve: ['view'],
      escalate: ['view']
    }
  },
  audit: {
    label: 'Audit Logs',
    actions: ['view', 'export'],
    protected: false,
    dependencies: {
      view: [],
      export: ['view']
    }
  },
  roles: {
    label: 'Roles & Permissions',
    actions: ['view', 'create', 'edit', 'delete', 'assign', 'clone'],
    protected: true,
    dependencies: {
      view: [],
      create: ['view'],
      edit: ['view'],
      delete: ['view'],
      assign: ['view'],
      clone: ['view']
    }
  },
  admins: {
    label: 'Admins',
    actions: ['view', 'create', 'edit', 'disable', 'reset_password', 'reset_mfa', 'revoke_sessions', 'view_login_history'],
    protected: false,
    dependencies: {
      view: [],
      create: ['view'],
      edit: ['view'],
      disable: ['view'],
      reset_password: ['view'],
      reset_mfa: ['view'],
      revoke_sessions: ['view'],
      view_login_history: ['view']
    }
  },
  settings: {
    label: 'Settings',
    actions: ['view', 'edit'],
    protected: false,
    dependencies: {
      view: [],
      edit: ['view']
    }
  },
  monitoring: {
    label: 'System Monitoring',
    actions: ['view'],
    protected: false,
    dependencies: {
      view: []
    }
  },
  system: {
    label: 'System',
    actions: ['view'],
    protected: false,
    dependencies: {
      view: []
    }
  }
};

export const NAVIGATION_DEFINITIONS = [
  { id: 'dashboard', label: 'Dashboard', permission: 'dashboard' },
  { id: 'users', label: 'User Management', permission: 'users' },
  { id: 'wallets', label: 'Wallet Management', permission: 'wallets' },
  { id: 'deposits', label: 'Deposits', permission: 'deposits' },
  { id: 'withdrawals', label: 'Withdrawals', permission: 'withdrawals' },
  { id: 'transactions', label: 'Transactions', permission: 'transactions' },
  { id: 'games', label: 'Games / Challenges', permission: 'games' },
  { id: 'live-games', label: 'Live Games', permission: 'live-games' },
  { id: 'disputes', label: 'Game Disputes', permission: 'disputes' },
  { id: 'risk', label: 'Fraud / Risk', permission: 'risk' },
  { id: 'referrals', label: 'Referrals', permission: 'referrals' },
  { id: 'notifications', label: 'Notifications', permission: 'notifications' },
  { id: 'support', label: 'Support Tickets', permission: 'support' },
  { id: 'roles', label: 'Roles & Permissions', permission: 'roles' },
  { id: 'admins', label: 'Admins', permission: 'admins' },
  { id: 'logs', label: 'Audit Logs', permission: 'audit' },
  { id: 'settings', label: 'Settings', permission: 'settings' },
  { id: 'monitoring', label: 'System Monitoring', permission: 'monitoring' }
];

export const ROLE_PERMISSION_DEFAULTS = {
  SUPERADMIN: buildAllPermissions(true),
  OPERATIONS_ADMIN: {
    dashboard: { view: true },
    users: { view: true, create: true, edit: true, delete: false, suspend: true, block: true, unblock: true, view_sensitive: true, view_wallet: true, view_transactions: true, view_games: true, view_login_history: true },
    wallets: { view: true, deposit: true, withdraw: true, refund: true, bonus: true, freeze: true, unfreeze: true, adjust: true },
    deposits: { view: true, approve: true, reject: true, refund: true, reconcile: true },
    withdrawals: { view: true, approve: true, reject: true, process: true, refund: true, reverse: true },
    transactions: { view: true, export: false, refund: true },
    games: { view: true, create: false, edit: true, delete: false, intervene: true, cancel: true, refund: true },
    'live-games': { view: true, intervene: true, cancel: true, monitor: true },
    disputes: { view: true, approve: true, reject: true, refund: true, escalate: true, request_evidence: true },
    risk: { view: true, investigate: true, flag: true, escalate: true, suspend: true, block: true },
    referrals: { view: true, create: true, edit: true, reward: true, freeze: true, investigate: true },
    notifications: { view: true, create: true, edit: true, delete: false, send: true, schedule: true },
    support: { view: true, assign: true, respond: true, resolve: true, escalate: true },
    audit: { view: true, export: true },
    roles: { view: true, create: true, edit: true, delete: false, assign: true, clone: true },
    admins: { view: true, create: true, edit: true, disable: true, reset_password: true, reset_mfa: true, revoke_sessions: true, view_login_history: true },
    settings: { view: true, edit: true },
    monitoring: { view: true },
    system: { view: true }
  },
  FINANCE_MANAGER: {
    dashboard: { view: true },
    users: { view: true, create: false, edit: false, delete: false, suspend: false, block: false, unblock: false, view_sensitive: true, view_wallet: true, view_transactions: true, view_games: false, view_login_history: false },
    wallets: { view: true, deposit: true, withdraw: true, refund: true, bonus: true, freeze: true, unfreeze: true, adjust: true },
    deposits: { view: true, approve: true, reject: true, refund: true, reconcile: true },
    withdrawals: { view: true, approve: true, reject: true, process: true, refund: true, reverse: true },
    transactions: { view: true, export: true, refund: true },
    games: { view: true, create: false, edit: false, delete: false, intervene: false, cancel: false, refund: false },
    'live-games': { view: true, intervene: false, cancel: false, monitor: true },
    disputes: { view: true, approve: false, reject: false, refund: false, escalate: false, request_evidence: false },
    risk: { view: true, investigate: true, flag: true, escalate: false, suspend: false, block: false },
    referrals: { view: true, create: false, edit: false, reward: true, freeze: false, investigate: true },
    notifications: { view: true, create: false, edit: false, delete: false, send: false, schedule: false },
    support: { view: false, assign: false, respond: false, resolve: false, escalate: false },
    audit: { view: true, export: true },
    roles: { view: false, create: false, edit: false, delete: false, assign: false, clone: false },
    admins: { view: false, create: false, edit: false, disable: false, reset_password: false, reset_mfa: false, revoke_sessions: false, view_login_history: false },
    settings: { view: true, edit: false },
    monitoring: { view: false },
    system: { view: false }
  },
  SUPPORT_MANAGER: {
    dashboard: { view: true },
    users: { view: true, create: false, edit: false, delete: false, suspend: false, block: false, unblock: false, view_sensitive: false, view_wallet: false, view_transactions: false, view_games: true, view_login_history: true },
    wallets: { view: false, deposit: false, withdraw: false, refund: false, bonus: false, freeze: false, unfreeze: false, adjust: false },
    deposits: { view: false, approve: false, reject: false, refund: false, reconcile: false },
    withdrawals: { view: false, approve: false, reject: false, process: false, refund: false, reverse: false },
    transactions: { view: false, export: false, refund: false },
    games: { view: true, create: false, edit: false, delete: false, intervene: false, cancel: false, refund: false },
    'live-games': { view: true, intervene: false, cancel: false, monitor: true },
    disputes: { view: true, approve: true, reject: true, refund: true, escalate: true, request_evidence: true },
    risk: { view: true, investigate: true, flag: true, escalate: false, suspend: false, block: false },
    referrals: { view: true, create: false, edit: false, reward: false, freeze: false, investigate: true },
    notifications: { view: true, create: true, edit: true, delete: false, send: true, schedule: true },
    support: { view: true, assign: true, respond: true, resolve: true, escalate: true },
    audit: { view: true, export: false },
    roles: { view: false, create: false, edit: false, delete: false, assign: false, clone: false },
    admins: { view: false, create: false, edit: false, disable: false, reset_password: false, reset_mfa: false, revoke_sessions: false, view_login_history: false },
    settings: { view: false, edit: false },
    monitoring: { view: false },
    system: { view: false }
  },
  VIEWER: {
    dashboard: { view: true },
    users: { view: true, create: false, edit: false, delete: false, suspend: false, block: false, unblock: false, view_sensitive: false, view_wallet: false, view_transactions: false, view_games: false, view_login_history: false },
    wallets: { view: true, deposit: false, withdraw: false, refund: false, bonus: false, freeze: false, unfreeze: false, adjust: false },
    deposits: { view: true, approve: false, reject: false, refund: false, reconcile: false },
    withdrawals: { view: true, approve: false, reject: false, process: false, refund: false, reverse: false },
    transactions: { view: true, export: false, refund: false },
    games: { view: true, create: false, edit: false, delete: false, intervene: false, cancel: false, refund: false },
    'live-games': { view: true, intervene: false, cancel: false, monitor: false },
    disputes: { view: true, approve: false, reject: false, refund: false, escalate: false, request_evidence: false },
    risk: { view: true, investigate: false, flag: false, escalate: false, suspend: false, block: false },
    referrals: { view: true, create: false, edit: false, reward: false, freeze: false, investigate: false },
    notifications: { view: true, create: false, edit: false, delete: false, send: false, schedule: false },
    support: { view: true, assign: false, respond: false, resolve: false, escalate: false },
    audit: { view: true, export: false },
    roles: { view: false, create: false, edit: false, delete: false, assign: false, clone: false },
    admins: { view: false, create: false, edit: false, disable: false, reset_password: false, reset_mfa: false, revoke_sessions: false, view_login_history: false },
    settings: { view: false, edit: false },
    monitoring: { view: false },
    system: { view: false }
  }
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildAllPermissions(enabled = true) {
  const permissions = createEmptyPermissionSet();
  Object.entries(PERMISSION_TREE).forEach(([module, definition]) => {
    const actionSet = definition.actions || [];
    permissions[module] = {};
    actionSet.forEach(action => {
      permissions[module][action] = enabled;
    });
  });
  permissions.dashboard = { view: enabled };
  return permissions;
}

export function createEmptyPermissionSet() {
  const permissions = {};
  Object.entries(PERMISSION_TREE).forEach(([module, definition]) => {
    permissions[module] = {};
    (definition.actions || []).forEach(action => {
      permissions[module][action] = false;
    });
  });
  permissions.dashboard = { view: false };
  return permissions;
}

export function getRolePermissions(role = 'SUPERADMIN') {
  const basePermissions = ROLE_PERMISSION_DEFAULTS[role] || ROLE_PERMISSION_DEFAULTS.SUPERADMIN;
  const permissions = sanitizePermissions(deepClone(basePermissions));
  return permissions;
}

export function hasPermission(permissions = {}, permissionPath = '') {
  if (!permissionPath) return false;
  const path = permissionPath.split('.');
  let current = permissions;
  for (const part of path) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return Boolean(current);
}

export function canAccessModule(permissions = {}, moduleName = '') {
  if (!moduleName) return false;
  const modulePermissions = permissions?.[moduleName];
  if (!modulePermissions) return false;
  if (typeof modulePermissions === 'boolean') return modulePermissions;
  return Object.values(modulePermissions).some(Boolean);
}

export function sanitizePermissions(permissions = {}) {
  const sanitized = deepClone(permissions || {});

  if (sanitized.dashboard !== undefined && sanitized.dashboard !== null && typeof sanitized.dashboard !== 'object') {
    sanitized.dashboard = { view: Boolean(sanitized.dashboard) };
  }

  Object.entries(PERMISSION_TREE).forEach(([module, definition]) => {
    if (sanitized[module] === undefined || sanitized[module] === null || typeof sanitized[module] !== 'object') {
      sanitized[module] = {};
    }

    const modulePermissions = sanitized[module] || {};
    const dependencyMap = definition.dependencies || {};

    Object.entries(dependencyMap).forEach(([action, dependencies]) => {
      const actionAllowed = Boolean(modulePermissions[action]);
      if (!actionAllowed) return;
      dependencies.forEach((dependency) => {
        modulePermissions[dependency] = true;
      });
    });

    if (modulePermissions.view === false) {
      Object.keys(modulePermissions).forEach((action) => {
        if (action !== 'view' && modulePermissions[action] === true) {
          modulePermissions.view = true;
        }
      });
    }

    sanitized[module] = modulePermissions;
  });

  if (sanitized.dashboard && typeof sanitized.dashboard === 'object') {
    sanitized.dashboard.view = Boolean(sanitized.dashboard.view);
  }

  return sanitized;
}

export function buildNavigation(permissions = {}) {
  const safePermissions = sanitizePermissions(permissions);
  return NAVIGATION_DEFINITIONS.filter((item) => {
    if (item.id === 'dashboard') return true;
    return canAccessModule(safePermissions, item.permission);
  }).map((item) => ({
    id: item.id,
    label: item.label,
    permission: item.permission
  }));
}
