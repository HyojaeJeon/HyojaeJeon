'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import { usePosI18n } from '@i18n/PosI18nProvider';
import { useLoginMutation } from '@store/api/index';

/**
 * LoginScreen -- POS 로그인 화면 (레거시 IDD_LOGIN)
 *
 * POS 부팅 시 최초 진입점. 직원 ID/비밀번호를 입력하여 인증하고,
 * 시작 금액을 설정한 뒤 영업을 개시한다.
 * Offline-First: 로그인 검증은 로컬 SQLite Staff 테이블 기준.
 *
 * Bridge Commands:
 *   STAFF:LOGIN, STAFF:SELECT, SYSTEM:MINIMIZE
 */

// ─── Types ───

type ActiveField = 'id' | 'password' | 'deposit' | 'change';
type LoginMode = 'normal' | 'order';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  initialEmployeeId?: string;
  initialPassword?: string;
  initialDeposit?: string;
}

// ─── Component ───

export default function LoginScreen({
  onLoginSuccess,
  initialEmployeeId = '',
  initialPassword = '',
  initialDeposit = '0',
}: LoginScreenProps) {
  const { t } = usePosI18n();
  const [login] = useLoginMutation();
  const [activeField, setActiveField] = useState<ActiveField>('id');
  const [id, setId] = useState(initialEmployeeId);
  const [password, setPassword] = useState(initialPassword);
  const [deposit, setDeposit] = useState(initialDeposit);
  const [changeAmount, setChangeAmount] = useState('0');
  const [dateTime, setDateTime] = useState('');
  const [businessDate, setBusinessDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ─── Clock ───
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime(
        `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
      // TODO: RTK Query systemApi.getConfig -> configCache 에서 영업일 조회
      setBusinessDate(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Keypad Input ───

  const getFieldSetter = useCallback((field: ActiveField) => {
    switch (field) {
      case 'id': return setId;
      case 'password': return setPassword;
      case 'deposit': return setDeposit;
      case 'change': return setChangeAmount;
    }
  }, []);

  const isAmountField = activeField === 'deposit' || activeField === 'change';

  const handleKeyInput = useCallback((key: string) => {
    const setter = getFieldSetter(activeField);
    setter((prev) => prev + key);
  }, [activeField, getFieldSetter]);

  const handleClear = useCallback(() => {
    const setter = getFieldSetter(activeField);
    setter(isAmountField ? '0' : '');
  }, [activeField, isAmountField, getFieldSetter]);

  const handleBackspace = useCallback(() => {
    const setter = getFieldSetter(activeField);
    setter((prev) => {
      const result = prev.slice(0, -1);
      return isAmountField && result === '' ? '0' : result;
    });
  }, [activeField, isAmountField, getFieldSetter]);

  // ─── Login ───

  const handleLogin = useCallback(async (mode: LoginMode) => {
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
  }, [id, password, deposit, login, onLoginSuccess, t]);

  // ─── Minimize / Close ───

  const handleMinimize = useCallback(() => {
    // TODO: SYSTEM:MINIMIZE Bridge command
    console.log('[LoginScreen] SYSTEM:MINIMIZE');
  }, []);

  // ─── Keypad Layout ───

  const keypadKeys = [
    ['7', '8', '9', 'CLR'],
    ['4', '5', '6', 'BS'],
    ['1', '2', '3', '0'],
  ];

  return (
    <div className="w-full h-full flex bg-pos-bg">
      {/* ═══ 좌측: 브랜드 영역 ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-pos-surface border-r border-pos-border relative">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-pos-2xl bg-primary-500 flex items-center justify-center shadow-pos-card">
            <span className="text-4xl font-black text-white">H</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-pos-text">{t('login.brandName')}</h1>
            <p className="text-xs text-pos-text-muted mt-1">{t('login.brandSubtitle')}</p>
          </div>
        </div>
        <div className="absolute bottom-6 text-center">
          <p className="text-2xs text-pos-text-muted">{t('login.version')}</p>
        </div>
      </div>

      {/* ═══ 우측: 로그인 폼 ═══ */}
      <div className="w-[440px] shrink-0 flex flex-col">
        {/* 상단 바 */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-pos-border shrink-0">
          <span className="text-xs text-pos-text-muted tabular-nums font-mono">{dateTime}</span>
          <button
            type="button"
            onClick={handleMinimize}
            className="w-8 h-8 rounded-pos-sm bg-pos-error flex items-center justify-center text-white cursor-pointer active:scale-[0.95]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="px-8 pt-8 space-y-4">
          {/* 직원 ID */}
          <InputRow
            icon={<IconUser />}
            label={t('login.staffId')}
            value={id}
            placeholder={t('login.staffId')}
            isActive={activeField === 'id'}
            onClick={() => setActiveField('id')}
          />

          {/* 비밀번호 */}
          <InputRow
            icon={<IconLock />}
            label={t('login.password')}
            value={password ? '\u25CF'.repeat(password.length) : ''}
            placeholder={t('login.password')}
            isActive={activeField === 'password'}
            onClick={() => setActiveField('password')}
          />

          {/* 시작 금액 */}
          <InputRow
            icon={<IconCash />}
            label={t('login.openingAmount')}
            value={deposit}
            placeholder="0"
            isActive={activeField === 'deposit'}
            onClick={() => setActiveField('deposit')}
            mono
          />

          {/* 거스름돈 */}
          <InputRow
            icon={<IconCash />}
            label={t('login.changeAmount')}
            value={changeAmount}
            placeholder="0"
            isActive={activeField === 'change'}
            onClick={() => setActiveField('change')}
            mono
          />

          {/* 영업일 날짜 (ReadOnly) */}
          <div className="flex items-center gap-3 h-touch px-4 rounded-pos-input border border-pos-border bg-pos-surface">
            <span className="text-pos-text-muted shrink-0"><IconCalendar /></span>
            <span className="text-xs text-pos-text-muted w-10 shrink-0">{t('login.businessDate')}</span>
            <span className="flex-1 text-md font-semibold text-pos-text tabular-nums font-mono">
              {businessDate}
            </span>
          </div>
        </div>

        {/* 에러 */}
        {errorMessage && (
          <div className="mx-8 mt-3 px-3 py-2 rounded-pos-sm bg-pos-bg border border-red-200 text-xs text-pos-error">
            {errorMessage}
          </div>
        )}

        {/* 숫자 키패드 + 로그인 버튼 */}
        <div className="flex-1 flex flex-col justify-center px-8 py-4">
          <div className="grid grid-cols-4 gap-2">
            {keypadKeys.map((row) =>
              row.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'CLR') handleClear();
                    else if (key === 'BS') handleBackspace();
                    else handleKeyInput(key);
                  }}
                  className={`
                    h-touch-xl flex items-center justify-center
                    rounded-pos-btn text-lg font-bold
                    cursor-pointer select-none
                    transition-transform duration-fast
                    active:scale-[0.95]
                    ${key === 'CLR'
                      ? 'bg-pos-success text-white'
                      : key === 'BS'
                        ? 'bg-primary-500 text-white'
                        : 'bg-pos-surface text-pos-text border border-pos-border'}
                  `}
                >
                  {key === 'BS' ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7 4l-5 6 5 6h11V4H7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M10 8l4 4M14 8l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : key}
                </button>
              ))
            )}
          </div>

          {/* 로그인 버튼 (Normal + Order Login) */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={() => handleLogin('normal')}
            >
              {t('login.login')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={() => handleLogin('order')}
            >
              {t('login.orderLogin')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── InputRow ───

function InputRow({ icon, label, value, placeholder, isActive, onClick, mono }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  isActive: boolean;
  onClick: () => void;
  mono?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 h-touch px-4 rounded-pos-input border cursor-pointer ${
        isActive ? 'border-primary-500 bg-primary-50' : 'border-pos-border bg-pos-bg'
      }`}
      onClick={onClick}
    >
      <span className="text-pos-text-muted shrink-0">{icon}</span>
      <span className="text-xs text-pos-text-muted w-14 shrink-0">{label}</span>
      <span className={`flex-1 text-md font-semibold text-pos-text min-h-[1.25rem] ${mono ? 'tabular-nums font-mono' : ''}`}>
        {value || <span className="text-pos-text-muted font-normal">{placeholder}</span>}
      </span>
    </div>
  );
}

// ─── Icons ───

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCash() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
