import type { CreateOrganizationRequest } from '../../../api/ColabriAPI';
import type { TFunction } from 'i18next';

export type CreateTrialFormEntries = Partial<
  Omit<CreateOrganizationRequest, 'status' | 'expiryDate'>
>;

type ValidationResult = {
  issues: { message: string; path: (keyof CreateTrialFormEntries)[] }[];
};

export function validate(
  formEntries: CreateTrialFormEntries,
  t: TFunction,
  isFixedUserProfile: boolean,
): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!formEntries.name) {
    issues = [
      ...issues,
      { message: t('trial.validation.companyNameRequired'), path: ['name'] },
    ];
  } else if (formEntries.name.length < 2) {
    issues = [
      ...issues,
      {
        message: t('trial.validation.companyNameLength'),
        path: ['name'],
      },
    ];
  }

  if (!formEntries.ownerEmail) {
    issues = [
      ...issues,
      { message: t('trial.validation.emailRequired'), path: ['ownerEmail'] },
    ];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEntries.ownerEmail)) {
    issues = [
      ...issues,
      { message: t('trial.validation.emailInvalid'), path: ['ownerEmail'] },
    ];
  }

  if (!formEntries.ownerFirstName && !isFixedUserProfile) {
    issues = [
      ...issues,
      {
        message: t('trial.validation.firstNameRequired'),
        path: ['ownerFirstName'],
      },
    ];
  }

  if (!formEntries.ownerLastName && !isFixedUserProfile) {
    issues = [
      ...issues,
      {
        message: t('trial.validation.lastNameRequired'),
        path: ['ownerLastName'],
      },
    ];
  }

  return { issues };
}
