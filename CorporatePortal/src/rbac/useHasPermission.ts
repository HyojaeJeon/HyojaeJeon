'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@store/index';
import type { PermissionKey } from './permissions';

const EMPTY: readonly string[] = Object.freeze([]);

/**
 * 로그인 사용자의 permission 세트를 기준으로 단일/다중 키 보유 여부를 평가한다.
 *
 * - user 가 null (unauthenticated / unhydrated) 인 경우에는 permissive=true 로 반환.
 *   NavigationRail 이 로그인 전에도 렌더되며, 모든 메뉴가 숨는 버그를 방지.
 *   서버 PermissionGuard 가 실제 fail-closed 를 보장.
 * - user 가 존재하지만 permissions 가 비어있는 경우에는 엄격하게 평가.
 * - CorporatePortal 은 SUPER_ADMIN wildcard 없음 (Corporate 사용자만 로그인).
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
    const permissions = user.permissions ?? EMPTY;
    const set = new Set(permissions);
    return mode === 'all' ? list.every((k) => set.has(k)) : list.some((k) => set.has(k));
  }, [user, keys, mode]);
}
