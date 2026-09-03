import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createEmptyPermissionSet,
  getRolePermissions,
  hasPermission,
  sanitizePermissions,
  buildNavigation
} from './rbac.js';

test('SUPERADMIN role includes all privileged permissions', () => {
  const permissions = getRolePermissions('SUPERADMIN');

  assert.ok(hasPermission(permissions, 'users.view'));
  assert.ok(hasPermission(permissions, 'wallets.adjust'));
  assert.ok(hasPermission(permissions, 'withdrawals.approve'));
  assert.ok(hasPermission(permissions, 'settings.edit'));
});

test('permission dependencies enforce view access for edit operations', () => {
  const permissions = createEmptyPermissionSet();
  permissions.users.edit = true;

  const sanitized = sanitizePermissions(permissions);

  assert.equal(sanitized.users.view, true);
  assert.equal(sanitized.users.edit, true);
});

test('financial approval requires viewing access', () => {
  const permissions = createEmptyPermissionSet();
  permissions.withdrawals.approve = true;

  const sanitized = sanitizePermissions(permissions);

  assert.equal(sanitized.withdrawals.view, true);
  assert.equal(sanitized.withdrawals.approve, true);
});

test('navigation respects permissions and hides unauthorized modules', () => {
  const permissions = createEmptyPermissionSet();
  permissions.dashboard = true;
  permissions.users.view = true;

  const nav = buildNavigation(permissions);

  const ids = nav.map(item => item.id);
  assert.ok(ids.includes('dashboard'));
  assert.ok(ids.includes('users'));
  assert.ok(!ids.includes('wallets'));
});
