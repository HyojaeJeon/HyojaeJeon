/**
 * BrandHQ Entitlement enums — 단일 원본.
 *
 * 기준서 §99 "BrandHQ Entitlement" 에 정의된 capability 기반 권한 모델.
 * CentralApi, BrandHQPortal, SuperAdmin/Portal, MealTicket 모듈이 모두 여기서 import 한다.
 */

export const BRAND_HQ_CAPABILITY = {
  POS: 'POS',
  MEAL_TICKET: 'MEAL_TICKET',
} as const;
export type BrandHqCapability =
  (typeof BRAND_HQ_CAPABILITY)[keyof typeof BRAND_HQ_CAPABILITY];

export const BRAND_HQ_ENTITLEMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  TRIAL: 'TRIAL',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const;
export type BrandHqEntitlementStatus =
  (typeof BRAND_HQ_ENTITLEMENT_STATUS)[keyof typeof BRAND_HQ_ENTITLEMENT_STATUS];

/**
 * Capability 가드 실패 시 GraphQL 에러 확장 코드.
 * BrandHQPortal 은 이 코드를 보고 "upgrade 안내 페이지" 로 라우팅한다.
 */
export const ENTITLEMENT_ERROR_CODE = {
  CAPABILITY_REQUIRED: 'CAPABILITY_REQUIRED',
  CAPABILITY_SUSPENDED: 'CAPABILITY_SUSPENDED',
  CAPABILITY_EXPIRED: 'CAPABILITY_EXPIRED',
} as const;
export type EntitlementErrorCode =
  (typeof ENTITLEMENT_ERROR_CODE)[keyof typeof ENTITLEMENT_ERROR_CODE];
