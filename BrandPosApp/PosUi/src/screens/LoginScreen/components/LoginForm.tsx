'use client';

import IconLabelField from '@shared/ui/molecules/IconLabelField';
import LoginIcons from './LoginIcons';
import type { ActiveField } from '../hooks/useLoginForm';

/**
 * LoginForm — 4개 입력 셀(직원ID/비밀번호/시작금액/거스름돈) + 영업일 ReadOnly.
 * 입력 위젯은 모두 shared/ui 의 IconLabelField 를 사용한다.
 */
interface LoginFormProps {
  t: (key: string) => string;
  activeField: ActiveField;
  setActiveField: (f: ActiveField) => void;
  id: string;
  password: string;
  deposit: string;
  changeAmount: string;
  businessDate: string;
}

export default function LoginForm({
  t,
  activeField,
  setActiveField,
  id,
  password,
  deposit,
  changeAmount,
  businessDate,
}: LoginFormProps) {
  return (
    <div className="px-8 pt-8 space-y-4">
      <IconLabelField
        icon={<LoginIcons.User />}
        label={t('login.staffId')}
        value={id}
        placeholder={t('login.staffId')}
        isActive={activeField === 'id'}
        onClick={() => setActiveField('id')}
      />
      <IconLabelField
        icon={<LoginIcons.Lock />}
        label={t('login.password')}
        value={password ? '\u25CF'.repeat(password.length) : ''}
        placeholder={t('login.password')}
        isActive={activeField === 'password'}
        onClick={() => setActiveField('password')}
      />
      <IconLabelField
        icon={<LoginIcons.Cash />}
        label={t('login.openingAmount')}
        value={deposit}
        placeholder="0"
        isActive={activeField === 'deposit'}
        onClick={() => setActiveField('deposit')}
        mono
      />
      <IconLabelField
        icon={<LoginIcons.Cash />}
        label={t('login.changeAmount')}
        value={changeAmount}
        placeholder="0"
        isActive={activeField === 'change'}
        onClick={() => setActiveField('change')}
        mono
      />
      <IconLabelField
        icon={<LoginIcons.Calendar />}
        label={t('login.businessDate')}
        value={businessDate}
        readOnly
        mono
      />
    </div>
  );
}
