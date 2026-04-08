/**
 * 한국어: WeTax provider 상수.
 *
 *   원본: `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의 `namespace WeTaxConstants`.
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §3
 *
 * Tiếng Việt: Hằng số provider WeTax — đối chiếu 1:1 với module C++ gốc.
 */

export const WeTaxConstants = {
  DATE_FORMAT: 'yyyyMMddHHmmss',

  INVOICE_TYPE: '0', // 0: Sales invoice
  FORM_NO: '1',
  TRANS_TYPE_SELL: '1' as const,
  TRANS_TYPE_RETURN: '2' as const,

  CURRENCY_CODE: 'VND' as const,
  PAYMENT_METHOD: 'TM/CK', // 현금/계좌이체
  EXCHANGE_RATE: 1.0,
  FEATURE: '1',

  SERIAL_TYPE: 'TKT',
  SERIAL_PREFIX_NO_CQT: 'K' as const,
  SERIAL_PREFIX_CQT: 'C' as const,

  DEFAULT_BUYER_NAME: 'Khách lẻ',

  // VAT 분기 (한국어 토큰은 BasicCode 와 동일)
  VAT_TYPE_INCLUDED: '포함' as const,
  VAT_TYPE_SEPARATED: '별도' as const,
  VAT_TYPE_EXEMPT: '면세' as const,

  // BasicCode TypeCode='34' 행의 TypeName 매핑
  CONFIG: {
    BASIC_CODE: '34',
    USERNAME: 'usernameWeTax',
    PASSWORD: 'passwordWeTax',
    TAX_CODE: 'taxCodeWeTax',
    STORE_CODE: 'storeCodeWeTax',
    SERIAL_NO: 'serialNoWeTax',
  },

  API: {
    LOGIN: '/api/wtx/pa/v1/auth/login',
    PUBLISH_INVOICE: '/api/wtx/pa/v1/pos/invoices-publish',
    COMPANY: '/api/wtx/pa/v1/company/',
  },

  HEADERS: {
    CONTENT_TYPE_JSON: 'application/json',
    AUTH_BEARER_PREFIX: 'Bearer ',
    ACCEPT_JSON: 'application/json',
  },

  /** Bearer token 캐시 TTL — login 응답의 expiresIn 의 90% 적용 (없으면 50분). */
  TOKEN_TTL_FALLBACK_SECONDS: 50 * 60,

  /** KYC 결과 캐시 TTL. */
  KYC_CACHE_TTL_SECONDS: 24 * 60 * 60,
} as const;

export type WeTaxConstantsType = typeof WeTaxConstants;
