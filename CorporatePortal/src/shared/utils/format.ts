import type { Locale } from '@i18n/messages';

const LOCALE_TAG: Record<string, string> = {
  ko: 'ko-KR',
  vi: 'vi-VN',
  en: 'en-US',
};

export function toLocaleTag(locale: Locale): string {
  return LOCALE_TAG[locale] ?? 'ko-KR';
}

export function defaultCurrencyForLocale(locale: Locale): string {
  if (locale === 'vi') return 'VND';
  if (locale === 'en') return 'USD';
  return 'KRW';
}

export function formatCurrency(
  amount: number | string,
  currencyCode = 'VND',
  localeTag = 'vi-VN',
): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCurrencyDecimal(
  amount: number | string,
  currencyCode = 'VND',
  localeTag = 'vi-VN',
): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(localeTag, {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(amount: number | string, localeTag = 'vi-VN'): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(localeTag).format(n);
}

export function formatDateTime(date: string | Date, localeTag = 'vi-VN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: string | Date, localeTag = 'vi-VN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const rtf = new Intl.RelativeTimeFormat(localeTag, { numeric: 'auto' });

  const seconds = Math.floor(diff / 1000);
  if (Math.abs(seconds) < 60) return rtf.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  return rtf.format(-days, 'day');
}
