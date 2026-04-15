import type { LogoutResult, RefreshSessionResult } from '@graphql/queries/auth';

const HTTP_URL = process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql';
const SESSION_REFRESH_LEEWAY_MS = 2 * 60_000; // refresh 2 min before session expiry
const RETRY_AFTER_SERVER_ERROR_MS = 30_000;
const AUTH_PATHS = ['/login'] as const;

const AUTH_ERROR_CODES = new Set([
  'UNAUTHENTICATED',
  'SESSION_REVOKED',
  'REFRESH_SESSION_EXPIRED',
  'INVALID_REFRESH_SESSION',
  'REFRESH_SESSION_REUSED',
  'ACCOUNT_INACTIVE',
]);

export function isAuthError(code: string): boolean {
  return AUTH_ERROR_CODES.has(code);
}

class GraphQLResponseError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'GraphQLResponseError';
  }
}

class GraphQLTransportError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'GraphQLTransportError';
  }
}

export type AuthRedirectReason = 'session-expired' | 'signed-out';

export interface AuthSessionPayload {
  accessToken: string;
  expiresIn: string;
  accessTokenExpiresAt: string;
  sessionExpiresAt: string;
  user: {
    id: string;
    loginId: string;
    displayName: string;
    userType: 'SUPER_ADMIN';
  };
}

type SessionListener = (payload: AuthSessionPayload | null) => void;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function buildLoginUrl(reason?: AuthRedirectReason): string {
  return reason ? `/login?reason=${reason}` : '/login';
}

const REFRESH_MUTATION = `
  mutation PortalRefreshSession {
    refreshSession {
      success {
        data {
          accessToken
          expiresIn
          accessTokenExpiresAt
          sessionExpiresAt
          user {
            id
            loginId
            displayName
            userType
          }
        }
      }
      error { code message details }
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation PortalLogout {
    logout {
      success { data }
      error { code message details }
    }
  }
`;

let sessionPayload: AuthSessionPayload | null = null;
let refreshTimer: number | null = null;
const listeners = new Set<SessionListener>();

function notify(payload: AuthSessionPayload | null): void {
  for (const listener of listeners) {
    listener(payload);
  }
}

/** Schedule refresh based on session expiry (not access token expiry). */
function scheduleRefresh(): void {
  if (typeof window === 'undefined') return;
  if (refreshTimer != null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  if (!sessionPayload) return;

  const sessionExpiresAt = Date.parse(sessionPayload.sessionExpiresAt);
  const delay = Math.max(5_000, sessionExpiresAt - Date.now() - SESSION_REFRESH_LEEWAY_MS);
  refreshTimer = window.setTimeout(() => {
    void refreshSessionWithOutcome().then((outcome) => {
      switch (outcome.kind) {
        case 'renewed':
          // 성공 — scheduleRefresh는 applyAuthPayload 내부에서 이미 재스케줄됨
          break;
        case 'auth_expired':
          // 인증 만료 → 로그아웃
          handleAuthFailure();
          break;
        case 'server_error':
          // 서버 에러 (500 등) → 로그아웃하지 않고 재시도
          console.warn('[scheduleRefresh] server error, retrying later:', outcome.error);
          if (sessionPayload) {
            const retryDelay =
              outcome.error instanceof GraphQLTransportError && outcome.error.retryAfterSeconds
                ? Math.max(5_000, outcome.error.retryAfterSeconds * 1000)
                : RETRY_AFTER_SERVER_ERROR_MS;
            refreshTimer = window.setTimeout(() => {
              scheduleRefresh();
            }, retryDelay);
          }
          break;
      }
    });
  }, delay);
}

async function postGraphql<T>(query: string): Promise<T> {
  const response = await fetch(HTTP_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const body = (await response.json()) as {
    data?: T;
    errors?: Array<{
      message?: string;
      extensions?: { code?: string; retryAfterSeconds?: number };
    }>;
  };

  const firstError = body.errors?.[0];
  const errorCode = firstError?.extensions?.code;

  if (!response.ok) {
    // HTTP-level errors: distinguish auth errors from server errors
    if (errorCode && isAuthError(errorCode)) {
      throw new GraphQLResponseError(errorCode, firstError?.message || `HTTP ${response.status}`);
    }
    throw new GraphQLTransportError(
      firstError?.message || `HTTP ${response.status}`,
      errorCode,
      firstError?.extensions?.retryAfterSeconds,
    );
  }
  if (body.errors?.length) {
    // GraphQL-level errors: distinguish auth errors from other errors
    if (errorCode && isAuthError(errorCode)) {
      throw new GraphQLResponseError(errorCode, firstError?.message || 'Auth error');
    }
    throw new GraphQLTransportError(
      firstError?.message || 'GraphQL transport error',
      errorCode,
      firstError?.extensions?.retryAfterSeconds,
    );
  }
  if (!body.data) {
    throw new GraphQLTransportError('GraphQL data missing');
  }

  // Check envelope error (success=null, error={code, message})
  const dataObj = body.data as Record<string, unknown>;
  const firstKey = Object.keys(dataObj)[0];
  if (firstKey) {
    const envelope = dataObj[firstKey] as
      | { success?: unknown; error?: { code: string; message: string } }
      | undefined;
    if (envelope && !envelope.success && envelope.error) {
      throw new GraphQLResponseError(envelope.error.code, envelope.error.message);
    }
  }

  return body.data;
}

export function getSessionSnapshot(): AuthSessionPayload | null {
  return sessionPayload;
}

export function subscribeSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyAuthPayload(payload: AuthSessionPayload): void {
  sessionPayload = payload;
  scheduleRefresh();
  notify(payload);
}

export function clearAccessSession(): void {
  if (typeof window !== 'undefined' && refreshTimer != null) {
    window.clearTimeout(refreshTimer);
  }
  refreshTimer = null;
  lastSuccessOutcome = null;
  lastSuccessAt = 0;
  sessionPayload = null;
  notify(null);
}

/** Return the in-memory access token (used for WS connectionParams only). */
export function getAccessToken(): string | null {
  return sessionPayload?.accessToken ?? null;
}

/**
 * Refresh 결과를 구분하기 위한 tagged type.
 * - 'renewed'      : 성공적으로 갱신됨
 * - 'auth_expired' : 인증 에러 (세션 만료/취소 등) → 로그아웃 필요
 * - 'server_error' : 서버 문제 (500, 네트워크 등) → 로그아웃 하지 않고 재시도
 */
export type RefreshOutcome =
  | { kind: 'renewed'; payload: AuthSessionPayload }
  | { kind: 'auth_expired' }
  | { kind: 'server_error'; error?: unknown };

/**
 * Refresh deduplication — 3가지 보호:
 * 1) inflight: 동시 호출을 단일 fetch에 합류
 * 2) cooldown: 성공 후 REFRESH_COOLDOWN_MS 이내 재호출은 캐시 반환 (네트워크 0회)
 * 3) errorLink의 __refreshRetried 플래그: operation당 1회 retry 제한
 */
const REFRESH_COOLDOWN_MS = 5_000;
let outcomeInFlight: Promise<RefreshOutcome> | null = null;
let lastSuccessOutcome: RefreshOutcome | null = null;
let lastSuccessAt = 0;

export async function refreshSessionWithOutcome(): Promise<RefreshOutcome> {
  // (1) 쿨다운: 최근 성공한 결과가 아직 유효하면 즉시 반환
  if (lastSuccessOutcome && Date.now() - lastSuccessAt < REFRESH_COOLDOWN_MS) {
    console.debug('[refresh] cooldown hit — returning cached result');
    return lastSuccessOutcome;
  }

  // (2) inflight: 이미 진행 중이면 동일 promise에 합류
  if (outcomeInFlight) {
    console.debug('[refresh] joining inflight promise');
    return outcomeInFlight;
  }

  console.debug('[refresh] starting NEW fetch');

  outcomeInFlight = (async (): Promise<RefreshOutcome> => {
    try {
      const data = await postGraphql<RefreshSessionResult>(REFRESH_MUTATION);
      const payload = data.refreshSession.success?.data ?? null;

      if (!payload) {
        const errorCode = data.refreshSession.error?.code;
        if (errorCode && isAuthError(errorCode)) {
          clearAccessSession();
          return { kind: 'auth_expired' };
        }
        return { kind: 'server_error', error: new Error(data.refreshSession.error?.message ?? 'Unknown refresh error') };
      }

      applyAuthPayload(payload as AuthSessionPayload);
      const outcome: RefreshOutcome = { kind: 'renewed', payload: payload as AuthSessionPayload };

      // 성공 결과를 쿨다운 캐시에 저장
      lastSuccessOutcome = outcome;
      lastSuccessAt = Date.now();

      return outcome;
    } catch (err) {
      if (
        (err instanceof GraphQLResponseError && isAuthError(err.code)) ||
        (err instanceof GraphQLTransportError && err.code && isAuthError(err.code))
      ) {
        clearAccessSession();
        return { kind: 'auth_expired' };
      }
      return { kind: 'server_error', error: err };
    } finally {
      outcomeInFlight = null;
    }
  })();

  return outcomeInFlight;
}

/** 호환용 — 기존 refreshSession 시그니처 유지 */
export async function refreshSession(): Promise<AuthSessionPayload | null> {
  const outcome = await refreshSessionWithOutcome();
  if (outcome.kind === 'renewed') return outcome.payload;
  if (outcome.kind === 'auth_expired') return null;
  throw (outcome.error ?? new Error('Refresh failed (server error)'));
}

/**
 * Cookie-based auth: the HttpOnly cookie is sent automatically.
 * This helper exists only for WS connectionParams compatibility.
 * For HTTP requests, the cookie handles authentication.
 */
export async function ensureAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return sessionPayload?.accessToken ?? null;
  }
  return sessionPayload?.accessToken ?? null;
}

export async function bootstrapSession(): Promise<AuthSessionPayload | null> {
  if (typeof window === 'undefined') {
    return sessionPayload;
  }
  if (sessionPayload) {
    scheduleRefresh();
    return sessionPayload;
  }
  return refreshSession();
}

export async function logoutSession(reason: AuthRedirectReason = 'signed-out'): Promise<void> {
  try {
    await postGraphql<LogoutResult>(LOGOUT_MUTATION);
  } finally {
    clearAccessSession();
    if (typeof window !== 'undefined' && !isAuthRoute(window.location.pathname)) {
      window.location.href = buildLoginUrl(reason);
    }
  }
}

export function handleAuthFailure(reason: AuthRedirectReason = 'session-expired'): void {
  clearAccessSession();
  if (typeof window !== 'undefined' && !isAuthRoute(window.location.pathname)) {
    window.location.href = buildLoginUrl(reason);
  }
}
