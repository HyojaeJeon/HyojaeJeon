'use client';

import { useId } from 'react';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * TextInput — 텍스트 입력 필드
 *
 * POS 터치스크린 전용: hover 효과 없음, active/focus 피드백만 사용.
 * 토큰 기반 스타일만 적용한다.
 */
export default function TextInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  fullWidth = false,
  className = '',
}: TextInputProps) {
  const id = useId();
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-pos-text"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          h-touch px-3 text-md
          rounded-pos-input
          border
          bg-pos-bg text-pos-text
          placeholder:text-pos-text-muted
          transition-all duration-[var(--duration-fast)] ease-default
          outline-none
          ${hasError
            ? 'border-pos-error focus:ring-2 focus:ring-pos-error/30'
            : 'border-pos-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30'
          }
          ${disabled
            ? 'opacity-[var(--opacity-disabled)] cursor-not-allowed bg-pos-surface'
            : ''
          }
          ${fullWidth ? 'w-full' : ''}
        `}
      />
      {hasError && (
        <span className="text-xs text-pos-error font-regular">
          {error}
        </span>
      )}
    </div>
  );
}
