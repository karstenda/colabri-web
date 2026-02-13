import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateOrganizationSetting } from '../../../hooks/useOrganizationSettings/useOrganizationSettings';
import { OrganizationSettingsKey } from '../../../../api/ColabriAPI';
import { AutoSetupFormData } from '../AutoSetupData';
import { useOrganization } from '../../../context/UserOrganizationContext/UserOrganizationProvider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoSetupSheetForm, {
  AutoSetupSheetFormState,
  FormFieldValue,
} from '../components/AutoSetupSheetForm/AutoSetupSheetForm';
import useNotifications from '../../../hooks/useNotifications/useNotifications';
import { validate } from '../components/AutoSetupSheetForm/AutoSetupSheetFormValidate';
import { useDreamSheet } from '../../../hooks/useDream/useDream';
import { preselectCountriesAndLanguages } from './AutoSetupSheetDefaults';
import AutoSetupSheetLoader from '../components/AutoSetupSheetLoader/AutoSetupSheetLoader';

export type AutoSetupSheetStepProps = {
  setupFormData: AutoSetupFormData;
  setSetupFormData: React.Dispatch<React.SetStateAction<AutoSetupFormData>>;
};

export type AutoSetupSheetStepRef = {
  onNext: () => Promise<boolean>;
};

const AutoSetupSheetStep = forwardRef<
  AutoSetupSheetStepRef,
  AutoSetupSheetStepProps
>(({ setupFormData, setSetupFormData }, ref) => {
  const { t } = useTranslation();
  const notifications = useNotifications();
  const organization = useOrganization();

  const { dreamSheet } = useDreamSheet(organization?.id || '');
  const { updateOrganizationSetting } = useUpdateOrganizationSetting(
    organization?.id || '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sheetFormState, setSheetFormState] = useState<AutoSetupSheetFormState>(
    {
      values: {
        name: setupFormData.product.name ?? '',
        countries: [],
        languages: [],
        masterLanguage: null,
      },
      errors: {},
    },
  );

  // Preselect already good form values.
  useEffect(() => {
    // Preselect languages and countries
    const preselection = preselectCountriesAndLanguages(
      setupFormData.countries,
      setupFormData.languages,
      3,
    );

    setSheetFormState({
      values: {
        name: setupFormData.product.name,
        countries: preselection.countries,
        languages: preselection.languages,
        masterLanguage: preselection.masterLanguage,
      },
      errors: {},
    });

    setSetupFormData((prev) => ({
      ...prev,
      sheet: {
        name: prev.product.name,
        countries: preselection.countries,
        languages: preselection.languages,
        masterLanguage: preselection.masterLanguage,
      },
    }));
  }, []);

  // When moving to the next step, save the selected languages
  useImperativeHandle(ref, () => ({
    onNext: async () => {
      // Validate the results first
      const { issues } = validate(sheetFormState.values);

      // Set the issues
      setSheetFormState((prev) => {
        const newState: AutoSetupSheetFormState = {
          ...prev,
          errors: {} as AutoSetupSheetFormState['errors'],
        };
        for (const issue of issues) {
          newState.errors[
            issue.path[0] as keyof AutoSetupSheetFormState['errors']
          ] = issue.message;
        }
        return newState;
      });

      // If there are issues, do not proceed
      if (issues && issues.length > 0) {
        return false;
      }

      // Proceed to saveing
      const saveResult = await save();

      // If saving is successful, finish the setup
      if (saveResult) {
        // Mark as completed
        setIsCompleted(true);

        // Wait for 3 seconds for the AutoSetupSheetLoader to properly complete.
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Finish the setup
        await finishSetup();
        return true;
      }
      return false;
    },
  }));

  // Create the product
  const save = async () => {
    // Quick validation
    if (
      !organization ||
      !sheetFormState.values.languages ||
      !sheetFormState.values.masterLanguage ||
      !sheetFormState.values.countries
    ) {
      return false;
    }

    try {
      // Create the product
      setIsSubmitting(true);
      await dreamSheet({
        name: sheetFormState.values.name,
        productId: setupFormData.product.id,
        masterLangCode: sheetFormState.values.masterLanguage.code,
        langCodes: sheetFormState.values.languages.map((l) => l.code),
        countryCodes: sheetFormState.values.countries
          .map((c) => c.code)
          .filter((code): code is string => !!code),
      });
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setIsSubmitting(false);
      notifications.show(
        t('autosetup.stepError', { error: (error as Error).message }),
        {
          severity: 'error',
          autoHideDuration: 5000,
        },
      );
      return false;
    }
  };

  const finishSetup = async () => {
    // Remember the skipping setup
    await updateOrganizationSetting({
      type: 'user-setting',
      key: OrganizationSettingsKey.OrganizationSettingsKeyShowQuickSetup,
      value: 'false',
    });
  };

  // Handle form field changes
  const handleFormFieldChange = (
    name: keyof AutoSetupSheetFormState['values'],
    value: FormFieldValue,
  ) => {
    // Update the sheet form state
    setSheetFormState((prev) => {
      return {
        ...prev,
        values: {
          ...prev.values,
          [name]: value,
        },
      };
    });

    // Update the setup form data
    setSetupFormData((prev) => ({
      ...prev,
      sheet: {
        ...prev.sheet,
        [name]: value,
      },
    }));
  };

  if (isSubmitting || isCompleted) {
    return (
      <Stack spacing={4}>
        <AutoSetupSheetLoader
          completed={isCompleted}
          sheetName={sheetFormState.values.name || ''}
        />
      </Stack>
    );
  } else {
    return (
      <Stack spacing={4}>
        <Stack spacing={2}>
          <Typography variant="body2" gutterBottom>
            {t('autosetup.steps.sheets.description1')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('autosetup.steps.sheets.description2')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('autosetup.steps.sheets.description3')}
          </Typography>
        </Stack>
        <AutoSetupSheetForm
          formState={sheetFormState}
          onFieldChange={handleFormFieldChange}
          isSubmitting={isSubmitting}
        />
      </Stack>
    );
  }
});

export default AutoSetupSheetStep;
