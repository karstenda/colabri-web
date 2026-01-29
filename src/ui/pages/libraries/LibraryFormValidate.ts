// Validation follows the [Standard Schema](https://standardschema.dev/).

import type { Library } from '../../../api/ColabriAPI';

export type LibraryFormEntries = Partial<
  Omit<Library, 'id' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'createdAt'>
>;

type ValidationResult = {
  issues: { message: string; path: (keyof LibraryFormEntries)[] }[];
};

export function validate(
  libraryFormEntries: LibraryFormEntries,
): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!libraryFormEntries.name) {
    issues = [
      ...issues,
      { message: 'libraries.validation.nameRequired', path: ['name'] },
    ];
  }

  // Make sure the name has a minimum length
  else if (libraryFormEntries.name.length < 2) {
    issues = [
      ...issues,
      { message: 'libraries.validation.nameMinLength', path: ['name'] },
    ];
  }

  // Make sure the name doesn't exceed maximum length
  else if (libraryFormEntries.name.length > 100) {
    issues = [
      ...issues,
      { message: 'libraries.validation.nameMaxLength', path: ['name'] },
    ];
  }

  if (!libraryFormEntries.type) {
    issues = [
      ...issues,
      { message: 'libraries.validation.typeRequired', path: ['type'] },
    ];
  } else if (libraryFormEntries.type.length > 50) {
    issues = [
      ...issues,
      { message: 'libraries.validation.typeMaxLength', path: ['type'] },
    ];
  }

  return { issues };
}
