export const ViettelConstants = {
  API: {
    LOGIN: '/auth/login',
    CREATE_INVOICE: '/services/einvoiceapplication/api/InvoiceAPI/InvoiceWS/createInvoice',
  },
  DEFAULTS: {
    INVOICE_TYPE: '1',
    CURRENCY_CODE: 'VND',
    EXCHANGE_RATE: 1,
    PAYMENT_METHOD: 'TM/CK',
    FEATURE: '1',
  },
  TOKEN_TTL_FALLBACK_SECONDS: 50 * 60,
} as const;
