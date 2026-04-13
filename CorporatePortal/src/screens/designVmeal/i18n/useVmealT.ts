/**
 * VMeal 디자인 화면 전용 i18n 훅.
 *
 * VMealApp 으로 이동 시 이 파일의 import 를
 *   import { useTranslation } from 'react-i18next';
 * 로 교체하고, useVmealT() 를 useTranslation() 으로 치환하면 끝입니다.
 *
 * - t('key') : 번역 문자열 반환 (dot-path 지원)
 * - t('key', { var: 'val' }) : {{var}} 보간 지원 (i18next 호환)
 * - locale / setLocale : 현재 언어 전환
 */
import { useCallback, useSyncExternalStore } from 'react';
import vi from './vi';
import ko from './ko';
import en from './en';

type Locale = 'vi' | 'ko' | 'en';

const locales: Record<Locale, Record<string, unknown>> = { vi, ko, en };

/* ─── Store (singleton, 브라우저 탭 단위) ─── */

let currentLocale: Locale = 'vi';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function setVmealLocale(locale: Locale) {
  currentLocale = locale;
  notify();
}

export function getVmealLocale(): Locale {
  return currentLocale;
}

/* ─── Path resolver ─── */

function get(obj: unknown, path: string): string {
  const keys = path.split('.');
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return path;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === 'string' ? cur : path;
}

/* ─── Hook ─── */

export function useVmealT() {
  const locale = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => currentLocale,
    () => currentLocale,
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let text = get(locales[locale], key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{{${k}}}`, String(v));
        }
      }
      return text;
    },
    [locale],
  );

  return { t, locale, setLocale: setVmealLocale };
}
