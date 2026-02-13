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
