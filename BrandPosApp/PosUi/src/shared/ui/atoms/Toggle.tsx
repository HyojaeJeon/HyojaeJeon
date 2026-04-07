'use client';

import { useId } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Toggle — 토글 스위치
 *
 * 44x24 트랙, 20x20 썸. POS 터치스크린 전용.
 * active 피드백만 사용한다.
 */
export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
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
          w-11 h-6
          rounded-pos-full
          transition-colors duration-[var(--duration-fast)] ease-default
          ${checked ? 'bg-primary-500' : 'bg-pos-border-strong'}
          ${!disabled ? 'active:scale-[0.96]' : ''}
        `}
      >
        <span
          className={`
            absolute top-0.5
            w-5 h-5
            rounded-pos-full
            bg-pos-bg
            shadow-pos-soft
            transition-transform duration-[var(--duration-fast)] ease-default
            ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}
          `}
        />
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
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
