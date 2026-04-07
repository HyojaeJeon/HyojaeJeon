'use client';

import { useId } from 'react';

interface RadioProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * Radio — 라디오 버튼
 *
 * 24x24 원형 터치 타겟. POS 터치스크린 전용.
 * active 피드백만 사용한다.
 */
export default function Radio({
  checked,
  onChange,
  label,
  disabled = false,
  name,
  className = '',
}: RadioProps) {
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
          rounded-pos-full
          border-2
          transition-all duration-[var(--duration-fast)] ease-default
          flex items-center justify-center
          ${checked
            ? 'border-primary-500'
            : 'border-pos-border-strong'
          }
          ${!disabled ? 'active:scale-[0.92]' : ''}
        `}
      >
        {checked && (
          <span className="w-3 h-3 rounded-pos-full bg-primary-500" />
        )}
      </span>
      <input
        id={id}
        type="radio"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        name={name}
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
