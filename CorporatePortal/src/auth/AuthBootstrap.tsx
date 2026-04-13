'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import {
  bootstrapSession,
  buildLoginUrl,
  isAuthRoute,
  isAuthError,
  getSessionSnapshot,
  handleAuthFailure,
  subscribeSession,
  type AuthSessionPayload,
} from '@auth/session';
import { ME_QUERY } from '@graphql/queries/auth';
import { useAppDispatch } from '@store/index';
import { clearSession, markHydrated, setSession } from '@store/slices/authSlice';

function syncRedux(
  payload: AuthSessionPayload | null,
  dispatch: ReturnType<typeof useAppDispatch>,
  permissions: string[] = [],
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
        userType: payload.user.userType ?? 'CORPORATE_ADMIN',
        corporateId: payload.user.corporateId ?? '',
        roles: [],
        permissions,
      },
      token: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      sessionExpiresAt: payload.sessionExpiresAt,
    }),
  );
}

async function fetchPermissions(
  client: ReturnType<typeof useApolloClient>,
): Promise<string[]> {
  try {
    const { data } = await client.query({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    return data?.me?.success?.data?.permissions ?? [];
  } catch {
    return [];
  }
}

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const client = useApolloClient();
  const authRoute = isAuthRoute(pathname);

  useEffect(() => {
    const existing = getSessionSnapshot();

    if (authRoute) {
      if (existing) {
        void fetchPermissions(client).then((perms) => {
          syncRedux(existing, dispatch, perms);
          dispatch(markHydrated());
          router.replace('/dashboard');
        });
      } else {
        dispatch(markHydrated());
      }
      return () => undefined;
    }

    const unsubscribe = subscribeSession((payload) => {
      if (!payload && typeof window !== 'undefined' && !isAuthRoute(window.location.pathname)) {
        window.location.href = buildLoginUrl('session-expired');
      }
    });

    if (existing) {
      void fetchPermissions(client).then((perms) => {
        syncRedux(existing, dispatch, perms);
        dispatch(markHydrated());
      });
    } else {
      // Cookie-based: refreshSession validates the HttpOnly cookie.
      // If valid, server returns user info + sets new cookies.
      // If invalid/expired, server returns error -> redirect to login.
      void bootstrapSession()
        .then(async (payload) => {
          if (!payload) {
            dispatch(markHydrated());
            return;
          }
          const perms = await fetchPermissions(client);
          syncRedux(payload, dispatch, perms);
          dispatch(markHydrated());
        })
        .catch((err: unknown) => {
          dispatch(markHydrated());
          if (isAuthError(err)) {
            handleAuthFailure('session-expired');
          }
        });
    }

    return unsubscribe;
  }, [authRoute, dispatch, router, client]);

  return null;
}
