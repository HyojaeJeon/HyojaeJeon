import ko from './locales/ko/common.json';
import vi from './locales/vi/common.json';
import en from './locales/en/common.json';

export const SUPPORTED_LOCALES = ['ko', 'vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ko';

export type Messages = typeof ko;

export const messages: Record<Locale, Messages> = { ko, vi, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}
