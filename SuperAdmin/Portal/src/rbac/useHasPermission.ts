'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@store/index';
import type { PermissionKey } from './permissions';

/**
 * 와일드카드 매칭 — `*`, `resource:*`, `resource:sub:*` 지원.
 * CentralApi의 `permissionDefinitions.ts`의 `matchPermission`과 동일 로직.
 */
function matchPermission(permSet: Set<string>, key: string): boolean {
  if (permSet.has(key)) return true;
  if (permSet.has('*')) return true;
  const parts = key.split(':');
  if (parts.length >= 2 && permSet.has(`${parts[0]}:*`)) return true;
  if (parts.length >= 3 && permSet.has(`${parts[0]}:${parts[1]}:*`)) return true;
  return false;
}

/**
 * 로그인 사용자의 permission 세트를 기준으로 단일/다중 키 보유 여부를 평가한다.
 * 와일드카드(`resource:*`) 매칭을 지원한다.
 *
 * - user === null (미인증/미수화): permissive=true (nav discovery 용)
 * - SUPER_ADMIN: 자동 wildcard (모든 권한)
 * - 서버 PermissionGuard가 실제 fail-closed 보장
 */
export function useHasPermission(
  keys: PermissionKey | PermissionKey[],
  mode: 'all' | 'any' = 'all',
): boolean {
  const user = useAppSelector((s) => s.auth.user);
  return useMemo(() => {
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length === 0) return true;
    if (!user) return true;
    if (user.userType === 'SUPER_ADMIN') return true;
    const permissions = user.permissions ?? [];
    const set = new Set(permissions);
    return mode === 'all'
      ? list.every((k) => matchPermission(set, k))
      : list.some((k) => matchPermission(set, k));
  }, [user, keys, mode]);
}
