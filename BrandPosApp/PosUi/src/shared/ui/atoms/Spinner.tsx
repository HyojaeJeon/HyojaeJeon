'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Spinner — 로딩 스피너
 *
 * animate-pos-spin 토큰 기반 회전 애니메이션.
 * 현재 텍스트 색상(currentColor)을 상속한다.
 */
export default function Spinner({
  size = 'md',
  className = '',
}: SpinnerProps) {
  const { t } = usePosI18n();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`
        animate-pos-spin
        ${sizeStyles[size]}
        ${className}
      `}
      role="status"
      aria-label={t('common.loadingA11y')}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        className="opacity-75"
      />
    </svg>
  );
}
