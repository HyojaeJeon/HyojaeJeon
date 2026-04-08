'use client';

import { useState } from 'react';

export type ActiveField = 'id' | 'password' | 'deposit' | 'change';

interface UseLoginFormParams {
  initialEmployeeId?: string;
  initialPassword?: string;
  initialDeposit?: string;
}

/**
 * useLoginForm — LoginScreen 입력 폼 상태 + 키패드 dispatch.
 *
 * activeField 에 따라 setter 를 선택해 키패드 입력/CLR/BS 를 라우팅한다.
 * 비즈니스 호출(login mutation) 은 useLoginSubmit 으로 분리되어 있다.
 */
export function useLoginForm({
  initialEmployeeId = '',
  initialPassword = '',
  initialDeposit = '0',
}: UseLoginFormParams = {}) {
  const [activeField, setActiveField] = useState<ActiveField>('id');
  const [id, setId] = useState(initialEmployeeId);
  const [password, setPassword] = useState(initialPassword);
  const [deposit, setDeposit] = useState(initialDeposit);
  const [changeAmount, setChangeAmount] = useState('0');

  const isAmountField = activeField === 'deposit' || activeField === 'change';

  const setterFor = (field: ActiveField) => {
    switch (field) {
      case 'id':       return setId;
      case 'password': return setPassword;
      case 'deposit':  return setDeposit;
      case 'change':   return setChangeAmount;
    }
  };

  const onKeyInput = (key: string) => {
    setterFor(activeField)((prev) => prev + key);
  };

  const onClear = () => {
    setterFor(activeField)(isAmountField ? '0' : '');
  };

  const onBackspace = () => {
    setterFor(activeField)((prev) => {
      const result = prev.slice(0, -1);
      return isAmountField && result === '' ? '0' : result;
    });
  };

  return {
    activeField,
    setActiveField,
    id,
    password,
    deposit,
    changeAmount,
    onKeyInput,
    onClear,
    onBackspace,
  };
}
