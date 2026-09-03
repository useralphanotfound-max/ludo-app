import { NextResponse } from 'next/server';
import { PERMISSION_TREE, getRolePermissions, sanitizePermissions } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

const SAFE_ROLE_SEED = [
  {
    id: 'SUPERADMIN',
    name: 'Super Admin',
    description: 'Full platform access with safety gates and audit logging enabled.',
    status: 'ACTIVE',
    createdBy: 'system',
    permissionCount: Object.values(PERMISSION_TREE).reduce((sum, module) => sum + module.actions.length, 0),
    adminCount: 1,
    permissions: getRolePermissions('SUPERADMIN')
  },
  {
    id: 'OPERATIONS_ADMIN',
    name: 'Operations Admin',
    description: 'Can manage user, wallet, gaming, and dispute operations.',
    status: 'ACTIVE',
    createdBy: 'system',
    permissionCount: 90,
    adminCount: 3,
    permissions: getRolePermissions('OPERATIONS_ADMIN')
  },
  {
    id: 'FINANCE_MANAGER',
    name: 'Finance Manager',
    description: 'Handles deposits, withdrawals, wallet adjustments, and monitoring.',
    status: 'ACTIVE',
    createdBy: 'system',
    permissionCount: 62,
    adminCount: 2,
    permissions: getRolePermissions('FINANCE_MANAGER')
  }
];

export async function GET() {
  return NextResponse.json({
    status: true,
    message: 'RBAC role catalog retrieved',
    data: {
      roles: SAFE_ROLE_SEED,
      modules: PERMISSION_TREE,
      roleCatalog: Object.keys(PERMISSION_TREE)
    }
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { roleId, roleName, description, status = 'ACTIVE', permissions } = body || {};

    if (!roleId || !roleName) {
      return NextResponse.json({ status: false, message: 'Role ID and name are required.' }, { status: 400 });
    }

    if (['SUPERADMIN'].includes(roleId.toUpperCase())) {
      return NextResponse.json({ status: false, message: 'System-critical roles cannot be edited through the generic API.' }, { status: 403 });
    }

    const cleanedPermissions = sanitizePermissions(permissions || getRolePermissions(roleId));

    return NextResponse.json({
      status: true,
      message: 'Role draft saved successfully',
      data: {
        id: roleId,
        name: roleName,
        description: description || '',
        status,
        permissions: cleanedPermissions,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message || 'Failed to save role permissions' }, { status: 500 });
  }
}
