import { useState, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSetupFormData } from '../AutoSetupData';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { LanguageSelector } from '../../../components/LanguageSelector';
import { useOrganization } from '../../../context/UserOrganizationContext/UserOrganizationProvider';
import {
  useAddContentLanguage,
  useContentLanguages,
} from '../../../hooks/useContentLanguages/useContentLanguage';

export type AutoSetupLanguageStepProps = {
  setupFormData: AutoSetupFormData;
  setSetupFormData: React.Dispatch<React.SetStateAction<AutoSetupFormData>>;
};

export type AutoSetupLanguageStepRef = {
  onNext: () => Promise<boolean>;
};

const AutoSetupLanguageStep = forwardRef<
  AutoSetupLanguageStepRef,
  AutoSetupLanguageStepProps
>(({ setupFormData, setSetupFormData }, ref) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { languages: orgLanguages } = useContentLanguages(
    organization?.id,
    organization !== null,
  );
  const { addContentLanguage } = useAddContentLanguage(organization?.id || '');

  // When moving to the next step, save the selected languages
  useImperativeHandle(ref, () => ({
    onNext: async () => {
      await save();
      return true;
    },
  }));

  // Function to save the selected languages to the organization
  const save = async () => {
    // Check if the current languages are available
    if (!orgLanguages) {
      return;
    }
    // Check which countries need to be added
    const toBeAddedLanguages = setupFormData.languages.filter((c) => {
      return !orgLanguages?.some((orgL) => orgL.code === c.code);
    });
    const toBeAddedLanguageCodes = toBeAddedLanguages.flatMap((c) =>
      c.code ? [c.code] : [],
    );

    // Add the languages
    if (toBeAddedLanguageCodes && toBeAddedLanguageCodes.length > 0) {
      setIsSubmitting(true);
      await addContentLanguage(toBeAddedLanguageCodes);
      setIsSubmitting(false);
    }
  };

  const onLanguageChange = (value: string | string[] | any | any[] | null) => {
    let languages: any[] = [];
    if (Array.isArray(value)) {
      languages = value.filter(
        (item): item is any =>
          typeof item === 'object' && item !== null && 'code' in item,
      );
    } else if (value && typeof value === 'object' && 'code' in value) {
      languages = [value];
    }
    setSetupFormData((prevData) => ({
      ...prevData,
      languages: languages,
    }));
  };

  return (
    <Stack spacing={4}>
      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.languages.description')}
      </Typography>

      <LanguageSelector
        scope={'platform'}
        value={setupFormData.languages}
        multiple={true}
        onChange={onLanguageChange}
      />
    </Stack>
  );
});

export default AutoSetupLanguageStep;
