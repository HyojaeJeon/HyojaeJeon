/**
 * 숫자/통화/날짜 포맷 유틸. 모든 함수는 locale (BCP-47) 을 받아 Intl 기반 포맷팅한다.
 */

export function formatNumber(n: number | string | null | undefined, locale = 'ko-KR'): string {
  if (n === null || n === undefined || n === '') return '—';
  const value = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * 통화 포맷터 — Intl.NumberFormat `currency` style.
 *
 * - currencyDisplay='symbol' 이면 ko-KR + KRW = "₩50,000", vi-VN + VND = "50.000 ₫", en-US + USD = "$50.00"
 * - 천단위 구분자는 locale 에 자동 (ko/en: comma, vi: dot)
 * - 소수 자릿수는 currency 별 기본 (VND/KRW = 0, USD/EUR = 2)
 *
 * @param amount — 숫자 또는 string 또는 null
 * @param currencyCode — ISO 4217 (KRW, VND, USD ...)
 * @param locale — BCP-47 (ko-KR, vi-VN, en-US ...)
 * @param options — Intl.NumberFormatOptions override
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = 'VND',
  locale: string = 'ko-KR',
  options: Intl.NumberFormatOptions = {},
): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    ...options,
  }).format(value);
}

/**
 * 통화의 천단위 구분자만 사용하고 심볼은 별도 위치에 배치하고 싶을 때.
 * `decimal` style 로 포맷 — locale 의 group separator 적용, currency symbol 없음.
 */
export function formatCurrencyDecimal(
  amount: number | string | null | undefined,
  currencyCode: string = 'VND',
  locale: string = 'ko-KR',
): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(value)) return '—';
  // currency 별 default fraction digits 를 가져와서 decimal 스타일에 적용
  const sample = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode });
  const fractionDigits = sample.resolvedOptions().minimumFractionDigits;
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * locale tag 매핑 헬퍼 — i18n locale 코드 (ko/vi/en) 를 BCP-47 로 변환.
 */
export function toLocaleTag(locale: string): string {
  if (locale === 'ko') return 'ko-KR';
  if (locale === 'vi') return 'vi-VN';
  if (locale === 'en') return 'en-US';
  return locale;
}

/**
 * locale 에 매핑된 기본 통화 코드. 향후 user 설정으로 override 가능.
 */
export function defaultCurrencyForLocale(locale: string): string {
  if (locale === 'ko') return 'KRW';
  if (locale === 'vi') return 'VND';
  if (locale === 'en') return 'USD';
  return 'VND';
}

export function formatRelativeTime(input: string | Date | null | undefined, locale = 'ko-KR'): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffMs);
  if (abs < 60 * 1000) return rtf.format(Math.round(diffMs / 1000), 'second');
  if (abs < 60 * 60 * 1000) return rtf.format(Math.round(diffMs / (60 * 1000)), 'minute');
  if (abs < 24 * 60 * 60 * 1000) return rtf.format(Math.round(diffMs / (60 * 60 * 1000)), 'hour');
  return rtf.format(Math.round(diffMs / (24 * 60 * 60 * 1000)), 'day');
}

export function formatDateTime(input: string | Date | null | undefined, locale = 'ko-KR'): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
