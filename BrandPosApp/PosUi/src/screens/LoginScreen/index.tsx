'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';
import BrandPanel from './components/BrandPanel';
import LoginTopBar from './components/LoginTopBar';
import LoginForm from './components/LoginForm';
import LoginActions from './components/LoginActions';
import { useClock } from './hooks/useClock';
import { useLoginForm } from './hooks/useLoginForm';
import { useLoginSubmit } from './hooks/useLoginSubmit';

/**
 * LoginScreen — POS 로그인 화면 (login.md / IDD_LOGIN)
 *
 * Reference 화면. 모든 화면이 따라야 하는 구조:
 *   index.tsx                         — thin orchestrator (state 조립 + 레이아웃)
 *   components/<PascalCase>.tsx       — 화면 전용 컴포지션 (shared/ui 사용)
 *   hooks/<useXxx>.ts                 — 화면 전용 상태/로직 분리
 *
 * 데이터:
 *   contracts/auth/login.types.ts     — bridge contract (단일 원본)
 *   mocks/fixtures/auth/login.fixture — default/empty/error 3종
 *   store/api/authApi.ts              — queryFn switch (mock | bridge | rest)
 *
 * 화면 컴포넌트는 RTK Query hook 만 사용하고 bridge/cefQuery 직접 호출 금지.
 */
interface LoginScreenProps {
  onLoginSuccess?: () => void;
  initialEmployeeId?: string;
  initialPassword?: string;
  initialDeposit?: string;
}

export default function LoginScreen({
  onLoginSuccess,
  initialEmployeeId,
  initialPassword,
  initialDeposit,
}: LoginScreenProps) {
  const { t } = usePosI18n();
  const { dateTime, businessDate } = useClock();

  const form = useLoginForm({
    initialEmployeeId,
    initialPassword,
    initialDeposit,
  });

  const { submit, isLoading, errorMessage } = useLoginSubmit({
    id: form.id,
    password: form.password,
    deposit: form.deposit,
    setActiveField: form.setActiveField,
    onLoginSuccess,
  });

  const handleMinimize = () => {
    // TODO: SYSTEM:MINIMIZE bridge endpoint (별도 endpoint 추가)
    console.log('[LoginScreen] SYSTEM:MINIMIZE');
  };

  return (
    <div className="w-full h-full flex bg-pos-bg">
      <BrandPanel
        title={t('login.brandName')}
        subtitle={t('login.brandSubtitle')}
        version={t('login.version')}
      />

      <div className="w-[440px] shrink-0 flex flex-col">
        <LoginTopBar dateTime={dateTime} onMinimize={handleMinimize} />

        <LoginForm
          t={t}
          activeField={form.activeField}
          setActiveField={form.setActiveField}
          id={form.id}
          password={form.password}
          deposit={form.deposit}
          changeAmount={form.changeAmount}
          businessDate={businessDate}
        />

        {errorMessage && (
          <div className="mx-8 mt-3 px-3 py-2 rounded-pos-sm bg-pos-bg border border-red-200 text-xs text-pos-error">
            {errorMessage}
          </div>
        )}

        <LoginActions
          t={t}
          isLoading={isLoading}
          onKeyInput={form.onKeyInput}
          onClear={form.onClear}
          onBackspace={form.onBackspace}
          onLogin={submit}
        />
      </div>
    </div>
  );
}
