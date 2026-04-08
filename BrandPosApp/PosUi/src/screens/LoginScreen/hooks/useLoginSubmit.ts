'use client';

import { useState } from 'react';
import { useLoginMutation } from '@store/api/index';
import type { LoginMode } from '@contracts/auth/login.types';
import { usePosI18n } from '@i18n/PosI18nProvider';

interface UseLoginSubmitParams {
  id: string;
  password: string;
  deposit: string;
  setActiveField: (f: 'id' | 'password' | 'deposit' | 'change') => void;
  onLoginSuccess?: () => void;
}

/**
 * useLoginSubmit — login mutation 호출 + 로딩/에러 상태.
 *
 * RTK Query useLoginMutation 만 사용한다. bridge / cefQuery 직접 호출 금지.
 * 데이터 소스 분기는 store/api/authApi.ts 의 queryFn switch 가 담당한다.
 */
export function useLoginSubmit({
  id,
  password,
  deposit,
  setActiveField,
  onLoginSuccess,
}: UseLoginSubmitParams) {
  const { t } = usePosI18n();
  const [login] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async (mode: LoginMode) => {
    if (!id) { setActiveField('id'); return; }
    if (!password) { setActiveField('password'); return; }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await login({
        employeeId: id,
        password,
        depositAmount: Number(deposit) || 0,
        loginMode: mode,
      }).unwrap();
      onLoginSuccess?.();
    } catch {
      setErrorMessage(t('login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, errorMessage };
}
