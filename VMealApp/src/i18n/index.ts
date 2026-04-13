import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi/common.json';
import ko from './locales/ko/common.json';
import en from './locales/en/common.json';

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: 'vi',
  fallbackLng: 'vi',
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export { i18n };
