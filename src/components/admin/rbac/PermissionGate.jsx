'use client';

import React from 'react';
import { hasPermission } from '@/lib/rbac';

export default function PermissionGate({ permissions, permission, children, fallback = null }) {
  if (!hasPermission(permissions, permission)) {
    return fallback;
  }
  return <>{children}</>;
}
