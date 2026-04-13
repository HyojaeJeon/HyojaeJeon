export const MisaConstants = {
  API: {
    LOGIN: '/api/integration/auth/token',
    CREATE_INVOICE: '/api/integration/invoice',
  },
  BASE_URL: {
    PRODUCTION: 'https://api.meinvoice.vn',
    SANDBOX: 'https://testapi.meinvoice.vn',
  },
  DEFAULTS: {
    CURRENCY_CODE: 'VND',
    EXCHANGE_RATE: 1,
    PAYMENT_METHOD: 'TM/CK',
    INVOICE_NAME: 'Hoá đơn giá trị gia tăng',
  },
  TOKEN_TTL_FALLBACK_SECONDS: 50 * 60,
} as const;
