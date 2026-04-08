/**
 * 한국어: Corporate(식권) 도메인 전용 caller ctx 어댑터. (P1-4 통합 후)
 *
 *   기존 `MealCallerCtx` 는 core 의 `CallerCtx` 와 동일 shape 이다. backward compat 을 위해
 *   타입 별칭과 기존 함수 명을 유지한다. 새 코드는 `@core/tenancy/caller-ctx` 를 직접 써도 좋다.
 *
 *   assertBrandScope / assertCorporateScope 는 corporate 도메인 특유의 정책 (BRAND_ADMIN 은
 *   자기 brand 만, CORPORATE_ADMIN 은 corporate 축만) 을 보존하기 위해 이 파일에 남는다.
 *
 * Tiếng Việt: Adapter caller-ctx đặc thù cho domain Corporate (phiên bản P1-4).
 */
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { DomainError } from '@core/errors/domain-error';
import {
  CallerCtx,
  callerCtxFromUser,
  withTargetBrand as coreWithTargetBrand,
  withTargetCorporate as coreWithTargetCorporate,
} from '@core/tenancy/caller-ctx';

// P1-4: 기존 이름 유지 — 타입 별칭만.
export type MealCallerCtx = CallerCtx;

export function mealCtxFromUser(user: JwtPayload): MealCallerCtx {
  return callerCtxFromUser(user);
}

/**
 * 한국어: target row 의 corporateId 가 caller 의 corporateContext 와 일치하는지 검증한다.
 *   SUPER_ADMIN 은 우회. CORPORATE_ADMIN 은 자기 corporate 만. 다른 userType 은 corporate 축이 아니므로 거절.
 */
export function assertCorporateScope(ctx: MealCallerCtx, targetCorporateId: string): void {
  if (ctx.userType === 'SUPER_ADMIN') return;
  if (!ctx.corporateId) {
    throw new DomainError({ code: 'CORPORATE_CONTEXT_MISSING', params: { userType: ctx.userType } });
  }
  if (ctx.corporateId !== targetCorporateId) {
    throw new DomainError({ code: 'CROSS_CORPORATE_ACCESS_DENIED', params: { callerCorporateId: ctx.corporateId,
      targetCorporateId } });
  }
}

/**
 * 한국어: target row 의 brandHqId 가 caller 의 brandContext 와 일치하는지 검증한다.
 *   SUPER_ADMIN 은 우회. BRAND_ADMIN 은 자기 brand 만. CORPORATE_ADMIN 은 brand 축이 아니므로 통과.
 */
export function assertBrandScope(ctx: MealCallerCtx, targetBrandHqId: string): void {
  if (ctx.userType === 'SUPER_ADMIN') return;
  if (ctx.userType === 'CORPORATE_ADMIN') return;
  if (!ctx.brandHqId) {
    throw new DomainError({ code: 'BRAND_CONTEXT_MISSING', params: { userType: ctx.userType } });
  }
  if (ctx.brandHqId !== targetBrandHqId) {
    throw new DomainError({ code: 'CROSS_BRAND_ACCESS_DENIED', params: { callerBrandHqId: ctx.brandHqId,
      targetBrandHqId } });
  }
}

// P1-4: core 의 with* 헬퍼를 재export (backward compat).
export const withTargetBrand = coreWithTargetBrand;
export const withTargetCorporate = coreWithTargetCorporate;
