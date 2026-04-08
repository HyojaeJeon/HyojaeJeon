/**
 * 한국어: DomainError — 모든 비즈니스/권한/검증 오류의 표준 베이스 클래스.
 *   service / resolver 는 user-facing 문장을 직접 만들지 않고 code + params 만 던진다.
 *   boundary (DomainExceptionFilter) 가 i18n 을 통해 message 를 채우고 표준 error 응답으로 반환한다.
 *
 *   필드:
 *     - code:      ErrorCode 카탈로그의 식별자
 *     - msgKey:    i18n 카탈로그 lookup key (기본값 = code)
 *     - params:    placeholder 보간용
 *     - domain:    i18n 카탈로그 도메인 (기본값 = 'common')
 *     - status:    HTTP 상태 코드 (REST 응답 + GraphQL extensions 에 사용)
 *     - details:   public error 응답에 포함될 구조화 메타
 *
 * Tiếng Việt: Lớp lỗi nghiệp vụ chuẩn — chỉ chứa code + metadata, không chứa chuỗi user-facing.
 */
import type { ErrorCodeValue } from './error-codes';

export interface DomainErrorInit {
  code: ErrorCodeValue | string;
  msgKey?: string;
  params?: Record<string, unknown>;
  domain?: string;
  status?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class DomainError extends Error {
  readonly code: string;
  readonly msgKey: string;
  readonly params?: Record<string, unknown>;
  readonly domain: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(init: DomainErrorInit) {
    super(init.code);
    this.name = 'DomainError';
    this.code = init.code;
    this.msgKey = init.msgKey ?? init.code;
    this.params = init.params;
    this.domain = init.domain ?? 'common';
    this.status = init.status ?? defaultStatusForCode(init.code);
    this.details = init.details;
    if (init.cause !== undefined) (this as unknown as { cause?: unknown }).cause = init.cause;
  }
}

/**
 * 한국어: 알려진 코드에 대한 기본 HTTP 상태. 명시적 status override 가 없을 때 사용.
 */
export function defaultStatusForCode(code: string): number {
  switch (code) {
    case 'UNAUTHENTICATED':
    case 'INVALID_CREDENTIALS':
    case 'ACCOUNT_INACTIVE':
      return 401;
    case 'FORBIDDEN':
    case 'PERMISSION_DENIED':
    case 'PERMISSION_DECORATOR_MISSING':
    case 'TENANT_CONTEXT_MISSING':
    case 'TENANT_SCOPE_AXIS_CONFLICT':
    case 'CROSS_TENANT_ACCESS_DENIED':
    case 'CROSS_CORPORATE_ACCESS_DENIED':
    case 'CROSS_BRAND_ACCESS_DENIED':
    case 'CORPORATE_CONTEXT_MISSING':
    case 'BRAND_CONTEXT_MISSING':
    case 'CORPORATE_CREATE_PLATFORM_ONLY':
    case 'ENROLLMENT_LIST_PLATFORM_ONLY':
    case 'SYSTEM_ROLE_DELETE_DENIED':
      return 403;
    case 'NOT_FOUND':
    case 'RESOURCE_NOT_FOUND':
    case 'USER_NOT_FOUND':
    case 'ROLE_NOT_FOUND':
    case 'TENANT_NOT_FOUND':
    case 'SCOPE_NOT_FOUND':
      return 404;
    case 'CONFLICT':
    case 'RESOURCE_CONFLICT':
    case 'ROLE_ALREADY_ASSIGNED':
    case 'ENROLLMENT_ALREADY_EXISTS':
    case 'ROLE_HAS_ACTIVE_ASSIGNMENTS':
    case 'INVALID_STATUS_TRANSITION':
      return 409;
    case 'VALIDATION_ERROR':
    case 'INVALID_USER_TYPE':
    case 'SCOPE_REQUIRED':
    case 'INVALID_AMOUNT':
    case 'PARENT_CATEGORY_BRAND_MISMATCH':
    case 'MENU_CATEGORY_BRAND_MISMATCH':
    case 'DEPARTMENT_CORPORATE_MISMATCH':
      return 400;
    case 'RATE_LIMITED':
    case 'TOO_MANY_LOGIN_ATTEMPTS':
      return 429;
    default:
      return 400;
  }
}
