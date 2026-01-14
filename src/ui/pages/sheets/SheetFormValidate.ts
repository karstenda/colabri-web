// Validation follows the [Standard Schema](https://standardschema.dev/).

import { SheetFormEntries } from './SheetForm';

type ValidationResult = {
  issues: { message: string; path: (keyof SheetFormEntries)[] }[];
};

export function validate(sheetFormEntries: SheetFormEntries): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!sheetFormEntries.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  return { issues };
}
