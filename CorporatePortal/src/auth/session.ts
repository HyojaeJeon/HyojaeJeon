import type { LogoutResult, RefreshSessionResult } from '@graphql/queries/auth';

const HTTP_URL = process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql';
const SESSION_REFRESH_LEEWAY_MS = 2 * 60_000; // refresh 2 min before session expiry
const RETRY_DELAY_MS = 30_000;
const AUTH_PATHS = ['/login', '/forgot-password'] as const;

export type AuthRedirectReason = 'session-expired' | 'signed-out';

/* ── Auth vs. server error classification ── */

const AUTH_ERROR_CODES = new Set([
  'UNAUTHENTICATED',
  'SESSION_REVOKED',
  'REFRESH_SESSION_EXPIRED',
  'INVALID_REFRESH_SESSION',
  'REFRESH_SESSION_REUSED',
  'ACCOUNT_INACTIVE',
]);

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AuthError) return true;
  if (error instanceof Error) {
    return AUTH_ERROR_CODES.has(error.message);
  }
  return false;
}

export interface AuthSessionPayload {
  accessToken: string;
  expiresIn: string;
  accessTokenExpiresAt: string;
  sessionExpiresAt: string;
  user: {
    id: string;
    loginId: string;
    displayName: string;
    userType: string;
    corporateId: string | null;
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
  mutation CorporateRefreshSession {
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
            corporateId
          }
        }
      }
      error { code message details }
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation CorporateLogout {
    logout {
      success { data }
      error { code message details }
    }
  }
`;

let sessionPayload: AuthSessionPayload | null = null;
let refreshTimer: number | null = null;
let refreshInFlight: Promise<AuthSessionPayload | null> | null = null;
const REFRESH_COOLDOWN_MS = 5_000;
let lastRefreshAt = 0;
let lastRefreshResult: AuthSessionPayload | null = null;
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
    void refreshSession().catch((err: unknown) => {
      if (isAuthError(err)) {
        handleAuthFailure();
      } else {
        console.warn('[session] refresh failed (server error), retrying in 30s', err);
        refreshTimer = window.setTimeout(() => {
          void refreshSession().catch((retryErr: unknown) => {
            if (isAuthError(retryErr)) {
              handleAuthFailure();
            }
          });
        }, RETRY_DELAY_MS);
      }
    });
  }, delay);
}

function getClientLocale(): string {
  if (typeof window === 'undefined') return 'ko';
  return window.localStorage.getItem('corporate-portal.locale') || 'ko';
}

async function postGraphql<T>(query: string): Promise<T> {
  const response = await fetch(HTTP_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      'accept-language': getClientLocale(),
    },
    body: JSON.stringify({ query }),
  });

  const body = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string; extensions?: { code?: string } }>;
  };

  if (!response.ok) {
    const errCode = body.errors?.[0]?.extensions?.code;
    const errMsg = body.errors?.[0]?.message || `HTTP ${response.status}`;
    if (errCode && AUTH_ERROR_CODES.has(errCode)) {
      throw new AuthError(errMsg, errCode);
    }
    throw new Error(errMsg);
  }
  if (body.errors?.length) {
    const errCode = body.errors[0]?.extensions?.code;
    const errMsg = body.errors[0]?.message || 'GraphQL transport error';
    if (errCode && AUTH_ERROR_CODES.has(errCode)) {
      throw new AuthError(errMsg, errCode);
    }
    throw new Error(errMsg);
  }
  if (!body.data) {
    throw new Error('GraphQL data missing');
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
  sessionPayload = null;
  notify(null);
}

/** Return the in-memory access token (used for WS connectionParams only). */
export function getAccessToken(): string | null {
  return sessionPayload?.accessToken ?? null;
}

export async function refreshSession(): Promise<AuthSessionPayload | null> {
  // Cooldown: skip if recently refreshed successfully
  if (lastRefreshResult && Date.now() - lastRefreshAt < REFRESH_COOLDOWN_MS) {
    return lastRefreshResult;
  }
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const data = await postGraphql<RefreshSessionResult>(REFRESH_MUTATION);
      const payload = data.refreshSession.success?.data ?? null;

      if (!payload) {
        const errorCode = data.refreshSession.error?.code;
        if (errorCode && AUTH_ERROR_CODES.has(errorCode)) {
          clearAccessSession();
          throw new AuthError(
            data.refreshSession.error?.message ?? 'Session expired',
            errorCode,
          );
        }
        return null;
      }

      applyAuthPayload(payload as AuthSessionPayload);
      lastRefreshResult = payload as AuthSessionPayload;
      lastRefreshAt = Date.now();
      return payload as AuthSessionPayload;
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw err;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
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
