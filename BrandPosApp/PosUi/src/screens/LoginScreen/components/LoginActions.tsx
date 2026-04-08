'use client';

import Button from '@shared/ui/atoms/Button';
import NumPad from '@shared/ui/molecules/NumPad';
import type { LoginMode } from '@contracts/auth/login.types';

/**
 * LoginActions — 키패드 + Login / Order Login 두 모드 버튼.
 */
interface LoginActionsProps {
  t: (key: string) => string;
  isLoading: boolean;
  onKeyInput: (k: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onLogin: (mode: LoginMode) => void;
}

export default function LoginActions({
  t,
  isLoading,
  onKeyInput,
  onClear,
  onBackspace,
  onLogin,
}: LoginActionsProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-8 py-4">
      <NumPad
        variant="compact"
        onInput={onKeyInput}
        onClear={onClear}
        onBackspace={onBackspace}
      />

      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onClick={() => onLogin('NORMAL')}
        >
          {t('login.login')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          loading={isLoading}
          onClick={() => onLogin('ORDER')}
        >
          {t('login.orderLogin')}
        </Button>
      </div>
    </div>
  );
}
