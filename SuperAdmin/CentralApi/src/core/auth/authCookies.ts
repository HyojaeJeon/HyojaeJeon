/**
 * 한국어:
 *   Auth Token 쿠키 관리 유틸리티.
 *   refresh token은 HttpOnly cookie + 서버 저장 hash/session 레코드로만 관리한다.
 *   access token도 HttpOnly cookie로 설정하여 XSS 공격을 방지한다.
 *
 *   프로덕션: __Host-refresh_token / __Host-access_token (Secure + Path=/ 강제, 서브도메인 공격 차단)
 *   개발환경: refresh_token / access_token (__Host- prefix 는 HTTPS 필수이므로 localhost 에서 사용 불가)
 *   로컬 개발은 localhost same-site(cross-port) 전제이므로 SameSite=Lax + non-Secure 로 고정한다.
 *
 * Tiếng Việt:
 *   Tiện ích quản lý cookie cho Auth Token.
 *   Refresh token chỉ được quản lý qua cookie HttpOnly + hash/session record trên server.
 *   Access token cũng được đặt trong cookie HttpOnly để ngăn chặn tấn công XSS.
 *
 *   Production: __Host-refresh_token / __Host-access_token (bắt buộc Secure + Path=/)
 *   Development: refresh_token / access_token (__Host- prefix yêu cầu HTTPS nên không dùng được trên localhost)
 *   Local dev dùng localhost same-site(cross-port), nên cố định SameSite=Lax + không bật Secure.
 */

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 프로덕션: __Host- prefix 로 서브도메인 공격 차단 (Secure + Path=/ 필수)
 * 개발환경: __Host- 없이 일반 쿠키 (localhost HTTP 호환)
 */
const REFRESH_COOKIE_NAME_PROD = '__Host-refresh_token';
const REFRESH_COOKIE_NAME_DEV = 'refresh_token';

const ACCESS_COOKIE_NAME_PROD = '__Host-access_token';
const ACCESS_COOKIE_NAME_DEV = 'access_token';

/** 기본 Max-Age: 30일 (2,592,000초) / Max-Age mặc định: 30 ngày */
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 2_592_000

function serializeCookie(cookieName: string, value: string, maxAge: number): string {
  const prod = isProduction();

  // __Host- prefix 는 Path=/ 필수, 일반 쿠키도 / 로 통일
  const path = '/';

  // 프로덕션: SameSite=Strict + Secure (same-origin 배포 전제)
  // 개발환경: localhost cross-port 는 same-site 이므로 SameSite=Lax 로 충분하다.
  //   local dev 에서는 Secure 를 강제하지 않아 curl/브라우저/테스트 환경 모두에서
  //   쿠키 저장/재전송 동작이 일관되게 유지되도록 한다.
  const parts = [
    `${cookieName}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`,
    'HttpOnly',
    prod ? 'SameSite=Strict' : 'SameSite=Lax',
  ];

  if (prod) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function refreshCookieName(): string {
  return isProduction() ? REFRESH_COOKIE_NAME_PROD : REFRESH_COOKIE_NAME_DEV;
}

function accessCookieName(): string {
  return isProduction() ? ACCESS_COOKIE_NAME_PROD : ACCESS_COOKIE_NAME_DEV;
}

// ---------------------------------------------------------------------------
// Public API — Refresh Token Cookie
// ---------------------------------------------------------------------------

export function readRefreshTokenCookie(
  req: { cookies?: Record<string, string | undefined> },
): string | null {
  // 두 이름 모두 확인 (프로덕션 마이그레이션 시 양립 지원)
  const value =
    req.cookies?.[REFRESH_COOKIE_NAME_PROD] ?? req.cookies?.[REFRESH_COOKIE_NAME_DEV];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function queueRefreshTokenCookie(
  responseCookies: string[] | undefined,
  token: string,
): void {
  responseCookies?.push(serializeCookie(refreshCookieName(), token, DEFAULT_REFRESH_MAX_AGE_SECONDS));
}

export function queueClearRefreshTokenCookie(
  responseCookies: string[] | undefined,
): void {
  responseCookies?.push(serializeCookie(refreshCookieName(), '', 0));
}

// ---------------------------------------------------------------------------
// Public API — Access Token Cookie
// ---------------------------------------------------------------------------

/**
 * 한국어: 요청 쿠키에서 access token 을 읽는다.
 *   프로덕션(__Host-access_token)과 개발(access_token) 이름 모두 확인한다.
 * Tiếng Việt: Đọc access token từ cookie request.
 *   Kiểm tra cả tên production (__Host-access_token) và development (access_token).
 */
export function readAccessTokenCookie(
  req: { cookies?: Record<string, string | undefined> },
): string | null {
  const value =
    req.cookies?.[ACCESS_COOKIE_NAME_PROD] ?? req.cookies?.[ACCESS_COOKIE_NAME_DEV];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * 한국어: access token 을 HttpOnly 쿠키로 설정한다.
 *   Max-Age 는 JWT 만료 시간(초)과 일치시킨다.
 * Tiếng Việt: Đặt access token vào cookie HttpOnly.
 *   Max-Age khớp với thời gian hết hạn JWT (tính bằng giây).
 */
export function queueAccessTokenCookie(
  responseCookies: string[] | undefined,
  token: string,
  maxAgeSeconds: number,
): void {
  responseCookies?.push(serializeCookie(accessCookieName(), token, maxAgeSeconds));
}

/**
 * 한국어: access token 쿠키를 삭제한다 (Max-Age=0).
 * Tiếng Việt: Xóa cookie access token (Max-Age=0).
 */
export function queueClearAccessTokenCookie(
  responseCookies: string[] | undefined,
): void {
  responseCookies?.push(serializeCookie(accessCookieName(), '', 0));
}
