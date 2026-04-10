'use client';

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_LOCALE,
  type Locale,
  SUPPORTED_LOCALES,
  getMessages,
  type Messages,
} from './messages';

type MessagePath = string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessagePath, fallback?: string) => string;
  supportedLocales: readonly Locale[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolvePath(obj: Messages, path: string): string | undefined {
  const parts = path.split('.');
  for (let split = 0; split <= parts.length; split++) {
    let cur: unknown = obj;
    let ok = true;
    for (let i = 0; i < split; i++) {
      if (cur && typeof cur === 'object' && parts[i] in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[parts[i]];
      } else {
        ok = false;
        break;
      }
    }
    if (!ok || !cur || typeof cur !== 'object') continue;
    const remainingKey = parts.slice(split).join('.');
    const value = (cur as Record<string, unknown>)[remainingKey];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

const LOCALE_STORAGE_KEY = 'corporate-portal.locale';

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return SUPPORTED_LOCALES.includes(stored as Locale) ? (stored as Locale) : DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  if (typeof window !== 'undefined' && locale === DEFAULT_LOCALE) {
    const stored = readStoredLocale();
    if (stored !== locale) {
      queueMicrotask(() => setLocaleState(stored));
    }
  }

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const msgs = getMessages(locale);
    return {
      locale,
      setLocale,
      supportedLocales: SUPPORTED_LOCALES,
      t: (key, fallback) => resolvePath(msgs, key) ?? fallback ?? key,
    };
  }, [locale, setLocale]);

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
