// Validation follows the [Standard Schema](https://standardschema.dev/).

import { ProductFormEntries } from './ProductForm';

type ValidationResult = {
  issues: { message: string; path: string[] }[];
};

export function validate(
  productFormEntries: ProductFormEntries,
): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!productFormEntries.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  return { issues };
}
