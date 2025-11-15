// Validation follows the [Standard Schema](https://standardschema.dev/).

import type { Group } from '../../../api/ColabriAPI';

export type GroupFormEntries = Partial<Omit<Group, 'id' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'createdAt' | 'system'>>;

type ValidationResult = { issues: { message: string; path: (keyof GroupFormEntries)[] }[] };

export function validate(groupFormEntries: GroupFormEntries): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!groupFormEntries.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  // Make sure the name has a minimum length
  else if (groupFormEntries.name.length < 2) {
    issues = [...issues, { message: 'Name must be at least 2 characters long', path: ['name'] }];
  }

  // Make sure the name doesn't exceed maximum length
  else if (groupFormEntries.name.length > 100) {
    issues = [...issues, { message: 'Name must not exceed 100 characters', path: ['name'] }];
  }

  // Validate description length if provided
  if (groupFormEntries.description && groupFormEntries.description.length > 500) {
    issues = [...issues, { message: 'Description must not exceed 500 characters', path: ['description'] }];
  }

  return { issues };
}