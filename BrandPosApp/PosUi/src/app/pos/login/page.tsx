'use client';

import { useRouter } from 'next/navigation';
import LoginScreen from '@screens/LoginScreen';

export default function LoginPage() {
  const router = useRouter();

  return <LoginScreen onLoginSuccess={() => router.replace('/')} />;
}
