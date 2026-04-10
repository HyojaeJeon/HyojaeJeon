'use client';

import { useAppSelector } from '@store/index';

/**
 * 현재 로그인한 Corporate Admin 의 corporateId 를 반환.
 * CorporatePortal 은 single-tenant (1 admin = 1 corporate) 이므로
 * 세션에서 자동 추출한다.
 */
export function useCorporateId(): string | null {
  return useAppSelector((s) => s.auth.user?.corporateId ?? null);
}
