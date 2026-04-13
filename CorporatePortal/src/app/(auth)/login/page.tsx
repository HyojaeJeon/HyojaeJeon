import { Suspense } from 'react';
import { LoginScreen } from '@screens/loginScreen';
import { LoginRouteClient } from './LoginRouteClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginScreen notice={null} />}>
      <LoginRouteClient />
    </Suspense>
  );
}
