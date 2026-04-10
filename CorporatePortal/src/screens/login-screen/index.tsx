'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { LogIn } from 'lucide-react';
import { Button, Input } from '@platform/shared-ui';
import { LOGIN_MUTATION, type LoginResult } from '@graphql/queries/auth';
import { setAuthToken } from '@graphql/client';
import { useAppDispatch } from '@store/index';
import { setSession } from '@store/slices/authSlice';
import { useI18n } from '@i18n/I18nProvider';

export function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading }] = useMutation<LoginResult>(LOGIN_MUTATION);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({
        variables: { input: { loginId, password, userType: 'CORPORATE_ADMIN' } },
      });
      const env = res.data?.login;
      if (env?.error) {
        setError(env.error.message);
        return;
      }
      const success = env?.success?.data;
      if (!success) {
        setError(t('login.loginFailed'));
        return;
      }
      setAuthToken(success.accessToken);
      dispatch(
        setSession({
          user: {
            id: success.user.id,
            loginId: success.user.loginId,
            displayName: success.user.displayName,
            userType: 'CORPORATE_ADMIN',
            corporateId: '',
            roles: [],
            permissions: [],
          },
          token: success.accessToken,
        }),
      );
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 p-6">
      <div
        className="w-full max-w-[400px] rounded-xl border bg-surface-3 p-8 shadow-lg"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-fg">
            <LogIn size={18} />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-fg">{t('app.name')}</h1>
            <p className="text-[11px] uppercase tracking-wider text-fg-subtle">{t('app.tagline')}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('login.loginId')}</label>
            <Input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="admin@company.com"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('login.password')}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-[12px] text-danger">
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            {t('login.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}
