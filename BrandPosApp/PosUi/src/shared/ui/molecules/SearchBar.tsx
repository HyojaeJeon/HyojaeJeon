'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

/**
 * SearchBar -- 검색 입력 바
 *
 * 왼쪽 검색 아이콘, 오른쪽 초기화 버튼. POS 메뉴/고객 검색에 사용.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder,
  onClear,
}: SearchBarProps) {
  const { t } = usePosI18n();
  const hasValue = value.length > 0;

  return (
    <div className="relative flex items-center w-full">
      {/* 검색 아이콘 */}
      <div className="absolute left-3 flex items-center pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-pos-text-muted">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 입력 필드 */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.search')}
        className={`
          w-full h-touch pl-10 pr-10
          rounded-pos-md
          bg-pos-surface border border-pos-border
          text-md text-pos-text
          placeholder:text-pos-text-muted
          outline-none
          transition-colors duration-fast ease-default
          focus:border-primary-300 focus:bg-pos-bg
        `}
      />

      {/* 초기화 버튼 */}
      {hasValue && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className={`
            absolute right-2
            w-7 h-7
            flex items-center justify-center
            rounded-pos-full
            bg-pos-border text-pos-text-secondary
            active:bg-gray-300 active:scale-[0.95]
            transition-transform duration-fast ease-default
            select-none cursor-pointer
          `}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
