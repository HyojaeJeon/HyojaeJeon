'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type AppLocale = 'ko' | 'vi' | 'en';
export type AppTheme = 'light' | 'dark';

export interface AppHeaderProps {
  /** 도메인명 (주문/결제/배달/고객/설정 등) */
  domain: string;
  /** 세부 스크린명 */
  screen?: string;
  /** 현재 언어 */
  locale?: AppLocale;
  /** 언어 변경 */
  onLocaleChange?: (locale: AppLocale) => void;
  /** 햄버거 메뉴 클릭 */
  onMenu?: () => void;
  /** 닫기 클릭 */
  onClose?: () => void;
  /** 도메인/스크린 사이에 추가로 표시할 요소 */
  extra?: ReactNode;
}

/** 전역 테마 적용: document.documentElement 의 data-theme 속성 토글 */
function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('pos-theme', theme);
  } catch {}
}

function readStoredTheme(): AppTheme {
  if (typeof document === 'undefined') return 'light';
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark' || current === 'light') return current;
  try {
    const stored = localStorage.getItem('pos-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return 'light';
}

const LOCALES: AppLocale[] = ['ko', 'vi', 'en'];
const LOCALE_LABEL: Record<AppLocale, string> = { ko: 'KO', vi: 'VI', en: 'EN' };

export default function AppHeader({
  domain,
  screen,
  locale = 'ko',
  onLocaleChange,
  onMenu,
  onClose,
  extra,
}: AppHeaderProps) {
  const [theme, setTheme] = useState<AppTheme>('light');
  useEffect(() => {
    const initial = readStoredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);
  const toggleTheme = () => {
    const next: AppTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <header className="h-12 w-full bg-pos-bg shadow-pos-card flex items-center px-3 gap-3 shrink-0">
      {/* 좌측: 햄버거 */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="메뉴 열기"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-pos-text cursor-pointer shrink-0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* 도메인 | 세부스크린 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-bold text-pos-text truncate">{domain}</span>
        {screen && (
          <>
            <span className="text-sm text-pos-border-strong shrink-0">|</span>
            <span className="text-sm font-medium text-pos-text-muted truncate">{screen}</span>
          </>
        )}
        {extra && <div className="ml-2 flex items-center gap-2 min-w-0">{extra}</div>}
      </div>

      {/* 우측: 테마 토글 + 다국어 세그먼트 + 닫기 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? '다크 테마로 전환' : '라이트 테마로 전환'}
          aria-pressed={theme === 'dark'}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-pos-surface text-pos-text cursor-pointer"
        >
          {theme === 'light' ? (
            // Moon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            // Sun
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div className="flex items-center rounded-lg p-0.5 gap-0.5 bg-pos-surface">
          {LOCALES.map((lng) => {
            const active = lng === locale;
            return (
              <button
                key={lng}
                type="button"
                onClick={() => onLocaleChange?.(lng)}
                aria-pressed={active}
                className={`min-w-[34px] h-7 px-2 text-[11px] font-bold rounded-md cursor-pointer ${
                  active ? 'bg-pos-bg text-pos-text shadow-sm' : 'text-pos-text-muted'
                }`}
              >
                {LOCALE_LABEL[lng]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[28px] px-3 text-[11px] font-bold text-pos-text-muted bg-pos-surface rounded-md cursor-pointer"
        >
          닫기
        </button>
      </div>
    </header>
  );
}
