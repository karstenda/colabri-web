import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import nl from './locales/nl/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';

export const defaultNS = 'translation';
export const resources = {
  en: {
    translation: en,
  },
  nl: {
    translation: nl,
  },
  fr: {
    translation: fr,
  },
  de: {
    translation: de,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    supportedLngs: ['en', 'nl', 'fr', 'de'],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
