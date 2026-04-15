'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  buildLoginUrl,
  isAuthRoute,
  getSessionSnapshot,
  handleAuthFailure,
  subscribeSession,
  refreshSessionWithOutcome,
  type AuthSessionPayload,
} from '@auth/session';
import { useAppDispatch } from '@store/index';
import { clearSession, markHydrated, setSession } from '@store/slices/authSlice';

function syncRedux(
  payload: AuthSessionPayload | null,
  dispatch: ReturnType<typeof useAppDispatch>,
): void {
  if (!payload) {
    dispatch(clearSession());
    return;
  }

  dispatch(
    setSession({
      user: {
        id: payload.user.id,
        loginId: payload.user.loginId,
        displayName: payload.user.displayName,
        userType: 'SUPER_ADMIN',
        roles: [],
        permissions: [],
      },
      token: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      sessionExpiresAt: payload.sessionExpiresAt,
    }),
  );
}

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const authRoute = isAuthRoute(pathname);

  useEffect(() => {
    const existing = getSessionSnapshot();

    if (authRoute) {
      if (existing) {
        syncRedux(existing, dispatch);
        dispatch(markHydrated());
        router.replace('/');
      } else {
        dispatch(markHydrated());
      }
      return () => undefined;
    }

    // Session listener syncs Redux state.
    // Redirect to login is handled ONLY by handleAuthFailure() — not here.
    // A null payload can also result from server errors (clearAccessSession not called),
    // so redirecting on every null payload would cause unwanted logouts.
    const unsubscribe = subscribeSession((payload) => {
      syncRedux(payload, dispatch);
    });

    if (existing) {
      syncRedux(existing, dispatch);
      dispatch(markHydrated());
    } else {
      // Cookie-based: refreshSession validates the HttpOnly cookie.
      // If valid, server returns user info + sets new cookies.
      // If invalid/expired, server returns auth error → redirect to login.
      // If server error (500 etc.) → stay on page, do NOT logout.
      void refreshSessionWithOutcome()
        .then((outcome) => {
          dispatch(markHydrated());
          switch (outcome.kind) {
            case 'renewed':
              // 성공 — syncRedux는 subscribeSession listener가 처리
              break;
            case 'auth_expired':
              // 인증 만료/취소 → 로그인 페이지로
              handleAuthFailure('session-expired');
              break;
            case 'server_error':
              // 서버 에러 (500 등) → 로그아웃하지 않음, 에러만 로깅
              console.warn('[AuthBootstrap] server error during bootstrap, staying on page:', outcome.error);
              break;
          }
        });
    }

    return unsubscribe;
  }, [authRoute, dispatch, router]);

  return null;
}
