'use client';

import type { ReactNode } from 'react';
import { useHasPermission } from './useHasPermission';
import type { PermissionKey } from './permissions';

interface PermissionGuardProps {
  keys: PermissionKey | PermissionKey[];
  mode?: 'all' | 'any';
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  keys,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGuardProps) {
  const allowed = useHasPermission(keys, mode);
  return <>{allowed ? children : fallback}</>;
}
