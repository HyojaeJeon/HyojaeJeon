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

    // Session listener syncs Redux only.
    // Redirect to login is handled exclusively by handleAuthFailure() — not here.
    // A null payload can result from server errors (not auth errors), so
    // redirecting on every null would cause unwanted logouts.
    const unsubscribe = subscribeSession(() => {
      // no-op: Redux sync happens in bootstrapSession then-block
    });

    if (existing) {
      void fetchPermissions(client).then((perms) => {
        syncRedux(existing, dispatch, perms);
        dispatch(markHydrated());
      });
    } else {
      // Cookie-based: refreshSession validates the HttpOnly cookie.
      // If valid, server returns user info + sets new cookies.
      // If invalid/expired (AuthError), redirect to login.
      // If server error (non-AuthError), stay on page — do NOT logout.
      void bootstrapSession()
        .then(async (payload) => {
          if (!payload) {
            // Server returned no payload but no auth error either (e.g. server 500).
            // Stay on page, don't redirect — will retry on next navigation.
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
            // Real auth failure (expired, revoked, etc.) → redirect to login
            handleAuthFailure('session-expired');
          } else {
            // Server error (500, network, etc.) → stay on page, log warning
            console.warn('[AuthBootstrap] server error during bootstrap, staying on page:', err);
          }
        });
    }

    return unsubscribe;
  }, [authRoute, dispatch, router, client]);

  return null;
}
