/**
 * 서버 에러 코드 → i18n 키 매핑.
 * DomainError.code 를 클라이언트 번역 키로 변환한다.
 */
const ERROR_MAP: Record<string, string> = {
  INVALID_CREDENTIALS: 'error.invalidCredentials',
  ACCOUNT_INACTIVE: 'error.accountInactive',
  SCOPE_REQUIRED: 'error.scopeRequired',
  PERMISSION_DENIED: 'error.permissionDenied',
  RESOURCE_NOT_FOUND: 'error.resourceNotFound',
  TOO_MANY_LOGIN_ATTEMPTS: 'error.tooManyLoginAttempts',
  UNAUTHENTICATED: 'error.unauthenticated',
  VALIDATION_ERROR: 'error.validationError',
};

export function mapServerError(code: string): string {
  return ERROR_MAP[code] ?? 'error.unknown';
}
