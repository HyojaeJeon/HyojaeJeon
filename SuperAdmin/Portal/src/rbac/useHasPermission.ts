'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@store/index';
import type { PermissionKey } from './permissions';

const EMPTY: readonly string[] = Object.freeze([]);

/**
 * 로그인 사용자의 permission 세트를 기준으로 단일/다중 키 보유 여부를 평가한다.
 *
 * - selector 는 user 참조 자체를 반환해 shallow equality 안정.
 * - list equality check 는 useMemo 에서 수행.
 * - **user 가 null (unauthenticated / unhydrated)** 인 경우에는 **permissive=true** 로 반환한다.
 *   이유: NavigationRail 이 로그인 전에도 렌더되며, 이때 권한이 비어있어 모든 메뉴가 숨는 버그를 방지.
 *   서버 측 PermissionGuard 가 실제 fail-closed 를 보장하므로 UI side 는 discovery 용으로 열어둔다.
 * - user 가 존재하지만 permissions 가 비어있는 경우에는 엄격하게 평가 (로그인 후 권한 0 = 전부 거절).
 */
export function useHasPermission(
  keys: PermissionKey | PermissionKey[],
  mode: 'all' | 'any' = 'all',
): boolean {
  const user = useAppSelector((s) => s.auth.user);
  return useMemo(() => {
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length === 0) return true;
    // 로그인 전 (user === null) 은 permissive — nav discovery 용
    if (!user) return true;
    // SUPER_ADMIN 은 wildcard — 모든 권한 자동 보유 (spec §3.1, sub-role: PLATFORM_SUPER_ADMIN)
    if (user.userType === 'SUPER_ADMIN') return true;
    const permissions = user.permissions ?? EMPTY;
    const set = new Set(permissions);
    return mode === 'all' ? list.every((k) => set.has(k)) : list.some((k) => set.has(k));
  }, [user, keys, mode]);
}
