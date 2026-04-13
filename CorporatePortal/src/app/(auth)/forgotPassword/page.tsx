'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // TODO: wire up requestPasswordReset mutation
    // await requestPasswordReset({ variables: { email } });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-[400px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <h1 className="mb-2 text-xl font-bold text-fg">
          {t('auth.forgotPassword', '비밀번호 찾기')}
        </h1>
        <p className="mb-6 text-[13px] text-fg-muted">
          {t(
            'auth.forgotPasswordDescription',
            '등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.',
          )}
        </p>

        {submitted ? (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-md p-3 text-[13px]"
              style={{ color: 'var(--success)', background: 'var(--success-soft)' }}
            >
              {t(
                'auth.forgotPasswordSuccess',
                '비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인해주세요.',
              )}
            </div>
            <Link href="/login" className="text-center text-[13px] text-accent hover:underline">
              {t('auth.backToLogin', '로그인으로 돌아가기')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-fg-muted">
                {t('auth.email', '이메일')}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
              />
            </div>
            <Button type="submit" variant="primary" disabled={loading || !email}>
              {loading
                ? t('common.loading', '처리 중...')
                : t('auth.sendResetLink', '재설정 링크 발송')}
            </Button>
            <Link href="/login" className="text-center text-[13px] text-fg-muted hover:underline">
              {t('auth.backToLogin', '로그인으로 돌아가기')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
