import commonKo from './locales/common/ko.json';
import commonEn from './locales/common/en.json';
import commonVi from './locales/common/vi.json';
import loginKo from './locales/login/ko.json';
import loginEn from './locales/login/en.json';
import loginVi from './locales/login/vi.json';
import tableKo from './locales/table/ko.json';
import tableEn from './locales/table/en.json';
import tableVi from './locales/table/vi.json';
import orderKo from './locales/order/ko.json';
import orderEn from './locales/order/en.json';
import orderVi from './locales/order/vi.json';
import paymentKo from './locales/payment/ko.json';
import paymentEn from './locales/payment/en.json';
import paymentVi from './locales/payment/vi.json';
import stockKo from './locales/stock/ko.json';
import stockEn from './locales/stock/en.json';
import stockVi from './locales/stock/vi.json';

export type LocaleCode = 'ko' | 'en' | 'vi';
export const DEFAULT_LOCALE: LocaleCode = 'ko';

const buildMessages = (
  common: typeof commonKo,
  login: typeof loginKo,
  table: typeof tableKo,
  order: typeof orderKo,
  payment: typeof paymentKo,
  stock: typeof stockKo
) => ({
  common,
  login,
  table,
  order,
  payment,
  stock,
});

export const MESSAGES = {
  ko: buildMessages(commonKo, loginKo, tableKo, orderKo, paymentKo, stockKo),
  en: buildMessages(commonEn, loginEn, tableEn, orderEn, paymentEn, stockEn),
  vi: buildMessages(commonVi, loginVi, tableVi, orderVi, paymentVi, stockVi),
} as const;

type MessageValue = string | number | boolean | null | undefined;

function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, source);
}

function interpolate(template: string, params?: Record<string, MessageValue>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? '' : String(value);
  });
}

export function resolveMessage(locale: LocaleCode, key: string, params?: Record<string, MessageValue>) {
  const tree = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  const found = getByPath(tree, key);
  if (typeof found === 'string') return interpolate(found, params);
  const fallback = getByPath(MESSAGES[DEFAULT_LOCALE], key);
  if (typeof fallback === 'string') return interpolate(fallback, params);
  return key;
}
