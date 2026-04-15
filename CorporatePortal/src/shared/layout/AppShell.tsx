'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NavigationRail } from './NavigationRail';
import { TopBar } from './TopBar';
import { useAppSelector } from '@store/index';
import { isAuthRoute, getSessionSnapshot } from '@auth/session';

/**
 * Auth hydration guard.
 *
 * Redirect to /login ONLY when:
 *   1. Bootstrap has completed (hydrated=true)
 *   2. Redux user is null (not set by AuthBootstrap)
 *   3. In-memory session is also null (no accessToken in module state)
 *   4. handleAuthFailure was explicitly called (which sets window.location directly)
 *
 * If bootstrap failed due to server error (not auth error), both user and
 * memory session will be null but handleAuthFailure was NOT called, so the
 * page stays put and doesn't redirect. The user can retry by navigating.
 *
 * To distinguish "auth expired" (should redirect) from "server error" (should stay),
 * we rely on handleAuthFailure() doing the redirect directly via window.location.href.
 * This useEffect only handles the "already logged in → redirect away from /login" case.
 */
function useAuthHydration() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const user = useAppSelector((s) => s.auth.user);
  const authRoute = isAuthRoute(pathname);
  const chromeless = authRoute || pathname.startsWith('/design');

  useEffect(() => {
    if (!hydrated) return;

    // If user is logged in and on auth page, redirect to dashboard
    if (user && authRoute) {
      router.replace('/dashboard');
    }
    // Note: redirect to /login for expired sessions is handled by
    // handleAuthFailure() in session.ts, NOT here.
    // This prevents server errors from triggering unwanted logouts.
  }, [chromeless, authRoute, hydrated, router, user]);

  return { chromeless, hydrated, user };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { chromeless, hydrated, user } = useAuthHydration();

  if (chromeless) {
    return <>{children}</>;
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 text-fg-muted">
        <div className="text-[13px] font-medium">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-0 text-fg">
      <NavigationRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
