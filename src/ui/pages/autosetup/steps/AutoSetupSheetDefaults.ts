import { OrgCountry } from '../../../../api/ColabriAPI';
import { ContentLanguage } from '../../../../editor/data/ContentLanguage';
import { getCountry, getTimezone } from 'countries-and-timezones';

export const preselectCountriesAndLanguages = (
  countries: OrgCountry[],
  languages: ContentLanguage[],
  nLanguages: number,
) => {
  // Let's rank all the countries based on the user's timezone
  const rankedCountries = [];
  // Try to find a country based on the user's timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const countryCodes = getTimezone(tz)?.countries;
  if (countryCodes) {
    for (const countryCode of countryCodes) {
      const matchedCountry = countries.find((c) => c.code === countryCode);
      if (matchedCountry) {
        rankedCountries.push(matchedCountry);
      }
    }
    // Now add the leftover countries
    for (const country of countries) {
      if (!rankedCountries.some((c) => c.code === country.code)) {
        rankedCountries.push(country);
      }
    }
  }
  // Couldn't find a country based on timezone, let's just add all countries to the ranked list
  else {
    rankedCountries.push(...countries);
  }

  // Iterate over the ranked countries and try to find languages based on the country
  const preselectedCountries = new Set<OrgCountry>();
  const preselectedLanguages = new Set<ContentLanguage>();
  for (const country of rankedCountries) {
    // Preselect this country
    preselectedCountries.add(country);

    // First rank the languages that are specific
    const rankedGenericLanguagesForCountry: ContentLanguage[] = [];
    const rankedLocalLanguagesForCountry: ContentLanguage[] = [];
    if (country.languages) {
      for (const cLangCode of country.languages) {
        const matchedLanguage = languages.find((l) => l.code === cLangCode);
        if (matchedLanguage) {
          if (matchedLanguage.code.includes('-')) {
            rankedLocalLanguagesForCountry.push(matchedLanguage);
          } else {
            rankedGenericLanguagesForCountry.push(matchedLanguage);
          }
        }
      }
    }

    // Check the browser languages and rank them higher if they match
    const browserLangCodes = navigator.languages || [navigator.language];
    for (const bLangCode of browserLangCodes) {
      const matchedGenericLanguage = rankedGenericLanguagesForCountry.find(
        (l) => l.code === bLangCode,
      );
      if (matchedGenericLanguage) {
        rankedGenericLanguagesForCountry.unshift(matchedGenericLanguage);
      }
      const matchedLocalLanguage = rankedLocalLanguagesForCountry.find(
        (l) => l.code === bLangCode,
      );
      if (matchedLocalLanguage) {
        rankedLocalLanguagesForCountry.unshift(matchedLocalLanguage);
      }
    }

    // Add the ranked languages for this country to the overall ranked lists
    // Start with the generic languages, prioritizing them over the localized ones as we can't have both (e.g. "en" and "en-US") as it doesn't make sense to preselect both.
    while (rankedGenericLanguagesForCountry.length > 0) {
      const lang = rankedGenericLanguagesForCountry.shift()!;
      if (preselectedLanguages.size < nLanguages) {
        // Check if the localized version of this language (e.g. "en-US" for "en") is already included.
        // If this is the case, replace the localized version with the generic one, as the generic one.
        const localizedLangs = [];
        for (const l of Array.from(preselectedLanguages)) {
          if (l.code.startsWith(lang.code + '-')) {
            localizedLangs.push(l);
          }
        }
        // Remove these localized versions from the preselected languages, as we will replace them with the generic version.
        for (const localizedLang of localizedLangs) {
          preselectedLanguages.delete(localizedLang);
        }
        // Add the generic version of the language
        preselectedLanguages.add(lang);
      } else {
        return {
          countries: Array.from(preselectedCountries),
          languages: Array.from(preselectedLanguages),
          masterLanguage: preselectMasterLanguage(
            Array.from(preselectedLanguages),
          ),
        };
      }
    }
    // After adding the generic languages, if we still have room for more languages, we can add the localized versions, but only if their generic version is not already selected.
    while (rankedLocalLanguagesForCountry.length > 0) {
      const lang = rankedLocalLanguagesForCountry.shift()!;
      if (preselectedLanguages.size < nLanguages) {
        // Get the generic version of this language (e.g. "en" for "en-US") and check if it's already included.
        const genericLangCode = lang.code.split('-')[0];
        const isGenericLangAlreadySelected = Array.from(
          preselectedLanguages,
        ).some(
          (l) =>
            l.code === genericLangCode ||
            l.code.startsWith(genericLangCode + '-'),
        );
        // Only add the localized version if the generic version is not already selected, to ensure diversity in the preselected languages.
        if (!isGenericLangAlreadySelected) {
          preselectedLanguages.add(lang);
        }
      } else {
        return {
          countries: Array.from(preselectedCountries),
          languages: Array.from(preselectedLanguages),
          masterLanguage: preselectMasterLanguage(
            Array.from(preselectedLanguages),
          ),
        };
      }
    }
  }
  return {
    countries: Array.from(preselectedCountries),
    languages: Array.from(preselectedLanguages),
    masterLanguage: preselectMasterLanguage(Array.from(preselectedLanguages)),
  };
};

const preselectMasterLanguage = (languages: ContentLanguage[]) => {
  // Try to find a master language based on the user's browser languages
  const browserLangCodes = navigator.languages || [navigator.language];
  for (const bLangCode of browserLangCodes) {
    const matchedLanguage = languages.find((l) => l.code === bLangCode);
    if (matchedLanguage) {
      return matchedLanguage;
    }
  }
  // If no match is found, return the first language as a fallback
  return languages.length > 0 ? languages[0] : null;
};
