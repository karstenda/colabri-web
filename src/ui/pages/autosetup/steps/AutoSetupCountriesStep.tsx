import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSetupFormData } from '../AutoSetupData';
import { CountrySelector } from '../../../components/CountrySelector';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { usePlatformContentLanguages } from '../../../hooks/useContentLanguages/useContentLanguage'; // Make sure path is correct
import { PlatformContentLanguage } from '../../../../api/ColabriAPI';
import {
  useAddCountries,
  useCountries,
} from '../../../hooks/useCountries/useCountries';
import { useOrganization } from '../../../context/UserOrganizationContext/UserOrganizationProvider';

export type AutoSetupCountriesStepProps = {
  setupFormData: AutoSetupFormData;
  setSetupFormData: React.Dispatch<React.SetStateAction<AutoSetupFormData>>;
};

export type AutoSetupCountriesStepRef = {
  onNext: () => Promise<boolean>;
};

const AutoSetupCountriesStep = forwardRef<
  AutoSetupCountriesStepRef,
  AutoSetupCountriesStepProps
>(({ setupFormData, setSetupFormData }, ref) => {
  const { t } = useTranslation();
  const { languages: allLanguages } = usePlatformContentLanguages();
  const organization = useOrganization();
  const { countries } = useCountries(organization?.id, organization !== null);
  const { addCountries } = useAddCountries(organization?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useImperativeHandle(ref, () => ({
    onNext: async () => {
      // Iterate over the countries
      const targetLanguages: PlatformContentLanguage[] = [];
      for (const c of setupFormData.countries) {
        const countryCode = c.code;
        const countryLangCodes = new Set<string>(
          c.languages?.flatMap((code) => code) || [],
        );

        // Iterate over all the languages to find matches
        for (const l of allLanguages) {
          if (l.code) {
            // Split the code by '-' to handle regional variants
            const lCodeParts = l.code.split('-');
            const lBaseCode = lCodeParts[0];
            const lCountryCode = lCodeParts.length > 1 ? lCodeParts[1] : null;

            // If the language has no country code, match only by base code
            if (countryLangCodes.has(lBaseCode)) {
              // If it's a generic language, add it.
              if (lCountryCode == null) {
                targetLanguages.push(l);
              }
              // If the language has a country code, match both base and country code
              else if (lCountryCode === countryCode) {
                targetLanguages.push(l);
              }
            }
          }
        }
      }

      setSetupFormData((prevData) => {
        // Create a Set of existing language codes to avoid duplicates
        const existingCodes = new Set(prevData.languages.map((l) => l.code));
        const newLanguages = targetLanguages.filter(
          (l) => l.code && !existingCodes.has(l.code),
        );

        if (newLanguages.length === 0) {
          return prevData;
        }

        return {
          ...prevData,
          languages: [...prevData.languages, ...newLanguages],
        };
      });

      await save();
      return true;
    },
  }));

  // Function to save the selected countries to the organization
  const save = async () => {
    // Check if the current countries are available
    if (!countries) {
      return;
    }
    // Check which countries need to be added
    const toBeAddedCountries = setupFormData.countries.filter((c) => {
      return !countries?.some((orgC) => orgC.code === c.code);
    });
    const toBeAddedCountryCodes = toBeAddedCountries.flatMap((c) =>
      c.code ? [c.code] : [],
    );

    // Add the countries
    if (toBeAddedCountryCodes && toBeAddedCountryCodes.length > 0) {
      setIsSubmitting(true);
      await addCountries(toBeAddedCountryCodes);
      setIsSubmitting(false);
    }
  };

  const onCountryChange = (value: string | string[] | any | any[] | null) => {
    let countries: any[] = [];
    if (Array.isArray(value)) {
      countries = value.filter(
        (item): item is any =>
          typeof item === 'object' && item !== null && 'code' in item,
      );
    } else if (value && typeof value === 'object' && 'code' in value) {
      countries = [value];
    }
    setSetupFormData((prevData) => ({
      ...prevData,
      countries: countries,
    }));
  };

  return (
    <Stack spacing={4}>
      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.countries.description')}
      </Typography>

      <CountrySelector
        scope={'platform'}
        value={setupFormData.countries}
        multiple={true}
        onChange={onCountryChange}
        disabled={isSubmitting}
      />
    </Stack>
  );
});

export default AutoSetupCountriesStep;
