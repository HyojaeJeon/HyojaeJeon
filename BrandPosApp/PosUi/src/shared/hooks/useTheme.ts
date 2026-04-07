'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGetBootstrapDataQuery } from '@store/api/index';
import { sendRequest } from '@bridge/PosRequestSender';

type Theme = 'light' | 'dark';

/**
 * useTheme — 라이트/다크 테마 전환 훅
 *
 * 흐름:
 *   [POS 시작]
 *     SYSTEM:BOOTSTRAP 응답의 theme 필드 → 초기 테마 적용
 *
 *   [유저가 테마 변경]
 *     setTheme('dark')
 *       → document에 data-theme 즉시 적용 (UI 전환)
 *       → SYSTEM:SET_THEME bridge 호출
 *         → C++ → SQLite LocalSetting에 영구 저장
 *
 *   [POS 재시작]
 *     BOOTSTRAP → SQLite에서 theme 로드 → 자동 적용
 */
export function useTheme() {
  const { data: bootstrap } = useGetBootstrapDataQuery();
  const [theme, setThemeState] = useState<Theme>('light');

  // BOOTSTRAP 데이터에서 초기 테마 로드
  useEffect(() => {
    if (!bootstrap) return;
    const saved: Theme = bootstrap.theme === 'dark' ? 'dark' : 'light';
    applyTheme(saved);
    setThemeState(saved);
  }, [bootstrap]);

  const setTheme = useCallback(async (t: Theme) => {
    // 1. 즉시 UI 반영
    applyTheme(t);
    setThemeState(t);

    // 2. C++ → SQLite에 영구 저장
    try {
      await sendRequest('SYSTEM:SET_THEME', { theme: t });
    } catch {
      // 저장 실패해도 UI는 이미 전환됨 — 다음 BOOTSTRAP에서 이전 값으로 복원될 수 있음
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}

/** document에 data-theme 속성 적용 */
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
