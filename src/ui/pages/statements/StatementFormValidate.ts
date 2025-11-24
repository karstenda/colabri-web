
// Validation follows the [Standard Schema](https://standardschema.dev/).

import { StatementFormEntries } from "./StatementForm";

type ValidationResult = { issues: { message: string; path: (keyof StatementFormEntries)[] }[] };

export function validate(statementFormEntries: StatementFormEntries): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!statementFormEntries.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  return { issues };
}
