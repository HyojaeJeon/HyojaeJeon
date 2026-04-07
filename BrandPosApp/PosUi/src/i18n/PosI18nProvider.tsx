'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type LocaleCode, resolveMessage } from './messages';

interface PosI18nContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string;
}

const PosI18nContext = createContext<PosI18nContextValue | null>(null);

interface PosI18nProviderProps {
  children: ReactNode;
  locale?: LocaleCode;
}

export function PosI18nProvider({ children, locale = DEFAULT_LOCALE }: PosI18nProviderProps) {
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>(locale);

  const value = useMemo<PosI18nContextValue>(
    () => ({
      locale: currentLocale,
      setLocale: setCurrentLocale,
      t: (key, params) => resolveMessage(currentLocale, key, params),
    }),
    [currentLocale]
  );

  return <PosI18nContext.Provider value={value}>{children}</PosI18nContext.Provider>;
}

export function usePosI18n() {
  const context = useContext(PosI18nContext);
  if (!context) {
    return {
      locale: DEFAULT_LOCALE as LocaleCode,
      setLocale: () => {},
      t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) =>
        resolveMessage(DEFAULT_LOCALE, key, params),
    };
  }
  return context;
}
