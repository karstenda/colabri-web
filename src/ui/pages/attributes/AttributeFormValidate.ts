
// Validation follows the [Standard Schema](https://standardschema.dev/).

import { AttributeFormEntries } from "./AttributeForm";

type ValidationResult = { issues: { message: string; path: (keyof AttributeFormEntries)[] }[] };

export function validate(attributeFormEntries: AttributeFormEntries): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!attributeFormEntries.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  if (!attributeFormEntries.type) {
    issues = [...issues, { message: 'Type is required', path: ['type'] }];
  }

  return { issues };
}
