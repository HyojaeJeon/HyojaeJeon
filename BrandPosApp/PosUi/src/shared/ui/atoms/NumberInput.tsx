'use client';

import { useId, useMemo } from 'react';

type Locale = 'ko' | 'vi' | 'en';

interface NumberInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  /** 천단위 포맷 로케일 (기본: 'ko') */
  locale?: Locale;
  /** 텍스트 정렬 (기본: 'right') */
  align?: 'left' | 'center' | 'right';
}

/**
 * 로케일별 천단위 구분자
 * ko: 1,000,000 (쉼표)
 * vi: 1.000.000 (마침표)
 * en: 1,000,000 (쉼표)
 */
const THOUSAND_SEP: Record<Locale, string> = {
  ko: ',',
  vi: '.',
  en: ',',
};

/** 숫자 문자열에 천단위 구분자 삽입 */
function formatWithThousands(raw: string, locale: Locale): string {
  if (!raw) return '';
  const isNegative = raw.startsWith('-');
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return isNegative ? '-' : '';
  const sep = THOUSAND_SEP[locale];
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return isNegative ? `-${formatted}` : formatted;
}

/** 포맷된 문자열에서 숫자만 추출 */
function stripFormat(formatted: string): string {
  const isNegative = formatted.startsWith('-');
  const digits = formatted.replace(/[^0-9]/g, '');
  return isNegative && digits ? `-${digits}` : digits;
}

/**
 * NumberInput — 숫자 전용 입력 필드
 *
 * - 천단위 구분자 자동 표시 (로케일별: ko=쉼표, vi=마침표, en=쉼표)
 * - 브라우저 기본 spinner(위/아래 화살표) 완전 제거 (CSS)
 * - 텍스트 우측 정렬 (금액 표시 기본)
 * - inputMode="numeric"으로 터치 키패드 숫자 전용
 */
export default function NumberInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  fullWidth = false,
  min,
  max,
  step,
  className = '',
  locale = 'ko',
  align = 'right',
}: NumberInputProps) {
  const id = useId();
  const hasError = Boolean(error);

  /** 화면에 표시할 포맷된 값 */
  const displayValue = useMemo(() => formatWithThousands(value, locale), [value, locale]);

  const handleChange = (rawInput: string) => {
    // 포맷 문자 제거 후 순수 숫자만 부모에 전달
    const stripped = stripFormat(rawInput);
    onChange(stripped);
  };

  const alignClass = align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right';

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-pos-text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`
          h-9 px-3 text-sm tabular-nums
          rounded-lg border
          bg-white text-pos-text
          placeholder:text-pos-text-muted
          transition-colors duration-100
          outline-none
          appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:m-0
          [&::-webkit-outer-spin-button]:m-0
          ${alignClass}
          ${hasError
            ? 'border-pos-error focus:ring-2 focus:ring-pos-error/30'
            : 'border-pos-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30'
          }
          ${disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50'
            : ''
          }
          ${fullWidth ? 'w-full' : ''}
        `}
      />
      {hasError && (
        <span className="text-xs text-pos-error">{error}</span>
      )}
    </div>
  );
}
