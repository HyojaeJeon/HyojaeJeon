'use client';

import { useSearchParams } from 'next/navigation';
import { LoginScreen } from '@screens/loginScreen';

type LoginNotice = 'session-expired' | 'signed-out' | null;

function parseLoginNotice(reason: string | null): LoginNotice {
  if (reason === 'session-expired' || reason === 'signed-out') return reason;
  return null;
}

export function LoginRouteClient() {
  const searchParams = useSearchParams();
  return <LoginScreen notice={parseLoginNotice(searchParams.get('reason'))} />;
}
