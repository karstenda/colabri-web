
// Validation follows the [Standard Schema](https://standardschema.dev/).

import { UserFormEntries } from "./UserForm";

type ValidationResult = { issues: { message: string; path: (keyof UserFormEntries)[] }[] };

export function validate(userFormEntries: UserFormEntries): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!userFormEntries.email) {
    issues = [...issues, { message: 'Email is required', path: ['email'] }];
  }

  // Make sure the email is in a valid format
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormEntries.email)) {
    issues = [...issues, { message: 'Email is not valid', path: ['email'] }];
  }

  if (!userFormEntries.firstName) {
    issues = [...issues, { message: 'First name is required', path: ['firstName'] }];
  }

  if (!userFormEntries.lastName) {
    issues = [...issues, { message: 'Last name is required', path: ['lastName'] }];
  }

  return { issues };
}