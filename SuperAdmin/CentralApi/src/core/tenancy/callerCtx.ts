/**
 * 한국어: Caller Context — 모든 platform service 의 "누가 이 메서드를 호출했는가" 표준 표현. (P1-4)
 *
 *   기존에 corporate 도메인은 `MealCallerCtx` 를 사용하고, brand 도메인은 service 내부 `evalCtxFor()`
 *   로 즉석 생성하는 두 가지 패턴이 혼재했다. 본 타입을 core 에 두고 모든 service 가 동일한 shape
 *   을 사용하도록 통일한다.
 *
 *   관계:
 *     - `CallerCtx` 는 PermissionService.EvaluationContext 와 호환 (같은 4 축 scope 필드).
 *     - `mealCtxFromUser()`, `brandCtxFromUser()` 등 도메인별 factory 는 이 shape 을 반환한다.
 *     - corporate 도메인의 `MealCallerCtx` 는 `CallerCtx` 의 별칭 (backward compat).
 *
 * Tiếng Việt: Context chung của người gọi service — hợp nhất mọi domain.
 */
import type { JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';

export interface CallerCtx {
  userType: string;
  userId: string;
  distributorId: string | null;
  brandHqId: string | null;
  branchId: string | null;
  corporateId: string | null;
}

/**
 * 한국어: JwtPayload → CallerCtx. 모든 resolver 가 service 진입 시 호출하는 표준 어댑터.
 */
export function callerCtxFromUser(user: JwtPayload): CallerCtx {
  return {
    userType: user.userType,
    userId: user.sub,
    distributorId: user.tenantContext?.distributorId ?? null,
    brandHqId: user.tenantContext?.brandHQId ?? null,
    branchId: user.tenantContext?.branchId ?? null,
    corporateId: user.tenantContext?.corporateId ?? null,
  };
}

/**
 * 한국어: target 의 brandHqId 로 ctx 를 재구성. capability/permission 검사 시 사용.
 */
export function withTargetBrand(ctx: CallerCtx, brandHqId: string): CallerCtx {
  return { ...ctx, brandHqId };
}

/**
 * 한국어: target 의 corporateId 로 ctx 를 재구성.
 */
export function withTargetCorporate(ctx: CallerCtx, corporateId: string): CallerCtx {
  return { ...ctx, corporateId };
}

/**
 * 한국어: target 의 branchId 로 ctx 를 재구성.
 */
export function withTargetBranch(ctx: CallerCtx, branchId: string): CallerCtx {
  return { ...ctx, branchId };
}

/**
 * 한국어: target 의 distributorId 로 ctx 를 재구성.
 */
export function withTargetDistributor(ctx: CallerCtx, distributorId: string): CallerCtx {
  return { ...ctx, distributorId };
}
