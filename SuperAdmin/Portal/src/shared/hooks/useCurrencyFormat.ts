'use client';

import { useCallback, useMemo } from 'react';
import { useI18n } from '@i18n/I18nProvider';
import {
  formatCurrency,
  formatCurrencyDecimal,
  formatNumber,
  toLocaleTag,
  defaultCurrencyForLocale,
} from '@shared/utils/format';

/**
 * 현재 선택된 locale + (옵션) 통화 코드 기반 포맷터를 반환하는 훅.
 *
 * 사용 예:
 *   const fmt = useCurrencyFormat('VND');
 *   fmt.currency(123456789)        // → "₫123,456,789" (ko-KR) / "123.456.789 ₫" (vi-VN)
 *   fmt.decimal(123456789)         // → "123,456,789" (ko-KR) / "123.456.789" (vi-VN)
 *   fmt.number(1000)               // → "1,000" / "1.000"
 */
export function useCurrencyFormat(currencyCode?: string) {
  const { locale } = useI18n();
  const tag = useMemo(() => toLocaleTag(locale), [locale]);
  const cc = currencyCode ?? defaultCurrencyForLocale(locale);

  const currency = useCallback(
    (n: number | string | null | undefined) => formatCurrency(n, cc, tag),
    [cc, tag],
  );
  const decimal = useCallback(
    (n: number | string | null | undefined) => formatCurrencyDecimal(n, cc, tag),
    [cc, tag],
  );
  const number = useCallback(
    (n: number | string | null | undefined) => formatNumber(n, tag),
    [tag],
  );

  return useMemo(
    () => ({ currency, decimal, number, locale: tag, currencyCode: cc }),
    [currency, decimal, number, tag, cc],
  );
}
