'use client';

import { useState, useRef, useEffect } from 'react';
import { usePosI18n } from '@i18n/PosI18nProvider';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Dropdown -- 선택 드롭다운
 *
 * 터치 환경 최적화 옵션 목록 오버레이. 외부 클릭 시 자동 닫힘.
 */
export default function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: DropdownProps) {
  const { t } = usePosI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      {/* 트리거 버튼 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`
          w-full h-touch px-4
          flex items-center justify-between
          rounded-pos-input
          border border-pos-border
          bg-pos-bg text-md
          transition-colors duration-fast ease-default
          select-none cursor-pointer
          active:border-primary-300
          ${disabled ? 'opacity-[var(--opacity-disabled)] cursor-not-allowed pointer-events-none' : ''}
          ${open ? 'border-primary-300' : ''}
        `}
      >
        <span className={selected ? 'text-pos-text' : 'text-pos-text-muted'}>
          {selected ? selected.label : placeholder ?? t('common.select')}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`
            text-pos-text-muted shrink-0
            transition-transform duration-fast
            ${open ? 'rotate-180' : ''}
          `}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 옵션 목록 */}
      {open && (
        <div
          className={`
            absolute top-full left-0 right-0 mt-1
            z-[var(--z-dropdown)]
            bg-pos-bg border border-pos-border
            rounded-pos-md shadow-pos-card
            max-h-[240px] overflow-y-auto
            animate-pos-slide-down
          `}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`
                  w-full h-touch-list px-4
                  flex items-center
                  text-md text-left
                  transition-colors duration-fast ease-default
                  select-none cursor-pointer
                  active:bg-primary-50
                  ${isSelected
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-pos-text'}
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
