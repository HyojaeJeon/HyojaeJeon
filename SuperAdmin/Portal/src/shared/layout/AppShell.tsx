'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NavigationRail } from './NavigationRail';
import { TopBar } from './TopBar';
import { useAppSelector } from '@store/index';
import { isAuthRoute, getSessionSnapshot } from '@auth/session';

function useAuthHydration() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const user = useAppSelector((s) => s.auth.user);
  const authRoute = isAuthRoute(pathname);

  useEffect(() => {
    if (!hydrated) return;

    // 서버 에러로 Redux user 가 비어있어도 메모리에 accessToken 이 있으면 로그인 유지
    const hasMemorySession = !!getSessionSnapshot();

    if (!user && !hasMemorySession && !authRoute) {
      router.replace('/login');
      return;
    }
    if (user && authRoute) {
      router.replace('/');
    }
  }, [authRoute, hydrated, router, user]);

  return { authRoute, hydrated };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { authRoute, hydrated } = useAuthHydration();

  if (authRoute) {
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
