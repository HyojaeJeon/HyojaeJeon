'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Common (nav, brand, status, ui, preview)
import koCommon from './ko/common/common.json';
import enCommon from './en/common/common.json';
import viCommon from './vi/common/common.json';

// Business
import koBusiness from './ko/business/business.json';
import enBusiness from './en/business/business.json';
import viBusiness from './vi/business/business.json';

// Innovation
import koInnovation from './ko/innovation/innovation.json';
import enInnovation from './en/innovation/innovation.json';
import viInnovation from './vi/innovation/innovation.json';

// Design
import koDesign from './ko/design/design.json';
import enDesign from './en/design/design.json';
import viDesign from './vi/design/design.json';

// Features
import koFeatures from './ko/features/features.json';
import enFeatures from './en/features/features.json';
import viFeatures from './vi/features/features.json';

// DB
import koDb from './ko/db/db.json';
import enDb from './en/db/db.json';
import viDb from './vi/db/db.json';

export type Locale = 'ko' | 'en' | 'vi';

function deepMerge(...objects: Record<string, unknown>[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) &&
          typeof result[key] === 'object' && result[key] !== null) {
        result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

const koMerged = deepMerge(koCommon, koBusiness, koInnovation, koDesign, koFeatures, koDb);
const enMerged = deepMerge(enCommon, enBusiness, enInnovation, enDesign, enFeatures, enDb);
const viMerged = deepMerge(viCommon, viBusiness, viInnovation, viDesign, viFeatures, viDb);

const localeMap: Record<Locale, Record<string, string>> = {
  ko: flattenJSON(koMerged),
  en: flattenJSON(enMerged),
  vi: flattenJSON(viMerged),
};

const localeLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  vi: 'Tiếng Việt',
};

function flattenJSON(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[path] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenJSON(value as Record<string, unknown>, path));
    }
  }
  return result;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
  localeLabels: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function DesignDocsI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ko');

  const t = useCallback(
    (key: string, fallback?: string) => {
      return localeMap[locale][key] ?? localeMap.ko[key] ?? fallback ?? key;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, localeLabels }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useDesignDocsT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useDesignDocsT must be used within DesignDocsI18nProvider');
  return ctx;
}
