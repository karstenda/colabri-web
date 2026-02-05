import { ContentLanguage } from '../../../editor/data/ContentLanguage';

/**
 * Get the content languages from the organization to use as default languages.
 *
 * @param orgLanguages
 * @returns
 */
export const getDefaultContentLanguages = (orgLanguages: ContentLanguage[]) => {
  // Check if there are default languages set in local storage
  const defaultLangsString = localStorage.getItem('defaultLangs');
  if (defaultLangsString) {
    try {
      const defaultLangs = JSON.parse(defaultLangsString);
      if (Array.isArray(defaultLangs) && defaultLangs.length > 0) {
        return defaultLangs
          .map((code) => orgLanguages.find((lang) => lang.code === code))
          .filter((lang) => lang !== undefined) as ContentLanguage[];
      }
    } catch (e) {
      console.error('Error parsing defaultLangs from localStorage', e);
    }
  }

  // If no default languages are set, use the browser's language
  const browserLangCodes = navigator.languages || [navigator.language];
  let defaultLangCodes = [...browserLangCodes];

  // Add english if it's not already included and included in the org languages
  if (
    !defaultLangCodes.includes('en') &&
    orgLanguages.find((lang) => lang.code === 'en')
  ) {
    defaultLangCodes.push('en');
  }

  // Return the ContentLanguage objects for the default languages
  return defaultLangCodes
    .map((code) => orgLanguages.find((lang) => lang.code === code))
    .filter((lang) => lang !== undefined) as ContentLanguage[];
};

/**
 * Update the default language codes in local storage.
 *
 * @param langCodes
 */
export const updateDefaultLangCodes = (langCodes: string[]) => {
  localStorage.setItem('defaultLangs', JSON.stringify(langCodes));
};
