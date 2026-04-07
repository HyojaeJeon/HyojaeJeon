'use client';

import { useId } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Checkbox — 체크박스
 *
 * 24x24 터치 타겟. POS 터치스크린에서 정확한 탭이 가능한 크기.
 * active 피드백만 사용한다.
 */
export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`
        inline-flex items-center gap-2.5
        select-none
        ${disabled ? 'opacity-[var(--opacity-disabled)] cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span
        className={`
          relative shrink-0
          w-6 h-6
          rounded-pos-xs
          border
          transition-all duration-[var(--duration-fast)] ease-default
          flex items-center justify-center
          ${checked
            ? 'bg-primary-500 border-primary-500'
            : 'bg-pos-bg border-pos-border-strong'
          }
          ${!disabled ? 'active:scale-[0.92]' : ''}
        `}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-white"
            aria-hidden="true"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      {label && (
        <span className="text-md text-pos-text">
          {label}
        </span>
      )}
    </label>
  );
}
