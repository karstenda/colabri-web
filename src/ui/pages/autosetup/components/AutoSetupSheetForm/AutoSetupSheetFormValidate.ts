// Validation follows the [Standard Schema](https://standardschema.dev/).

import { AutoSetupSheetFormEntries } from './AutoSetupSheetForm';

type ValidationResult = {
  issues: { message: string; path: string[] }[];
};

export function validate(
  sheetFormEntries: AutoSetupSheetFormEntries,
): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!sheetFormEntries.languages || sheetFormEntries.languages.length === 0) {
    issues = [
      ...issues,
      { message: 'Languages are required', path: ['languages'] },
    ];
  }

  if (sheetFormEntries.languages && sheetFormEntries.languages.length > 4) {
    issues = [
      ...issues,
      {
        message:
          'Only a maximum of 4 languages are allowed for an example sheet',
        path: ['languages'],
      },
    ];
  }

  if (sheetFormEntries.languages && sheetFormEntries.languages.length > 0) {
    // Check if a generic and local version of the same language is selected (e.g. "en" and "en-US").
    const genericLangCodes = sheetFormEntries.languages.map(
      (lang) => lang.code.split('-')[0],
    );
    for (const genericLangCode of genericLangCodes) {
      let sameLangs = [];
      for (const lang of sheetFormEntries.languages) {
        if (
          lang.code === genericLangCode ||
          lang.code.startsWith(genericLangCode + '-')
        ) {
          sameLangs.push(lang);
        }
      }
      if (sameLangs.length > 1) {
        issues = [
          ...issues,
          {
            message: `Multiple versions of the same language are selected: '${sameLangs[0].name}' and '${sameLangs[1].name}'`,
            path: ['languages'],
          },
        ];
      }
    }
  }

  if (!sheetFormEntries.masterLanguage) {
    issues = [
      ...issues,
      { message: 'Master language is required', path: ['masterLanguage'] },
    ];
  } else if (
    sheetFormEntries.languages &&
    sheetFormEntries.languages.length > 0 &&
    !sheetFormEntries.languages.some(
      (lang) => lang.code === sheetFormEntries.masterLanguage?.code,
    )
  ) {
    issues = [
      ...issues,
      {
        message: 'Master language must be included in languages',
        path: ['masterLanguage'],
      },
    ];
  }

  if (!sheetFormEntries.countries || sheetFormEntries.countries.length === 0) {
    issues = [
      ...issues,
      { message: 'Countries are required', path: ['countries'] },
    ];
  }

  return { issues };
}
