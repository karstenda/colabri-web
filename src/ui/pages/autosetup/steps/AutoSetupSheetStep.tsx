import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useUpdateOrganizationSetting } from '../../../hooks/useOrganizationSettings/useOrganizationSettings';
import { OrganizationSettingsKey } from '../../../../api/ColabriAPI';
import { AutoSetupFormData } from '../AutoSetupData';
import { useOrganization } from '../../../context/UserOrganizationContext/UserOrganizationProvider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
  const organization = useOrganization();
  const navigate = useNavigate();
  const { updateOrganizationSetting } = useUpdateOrganizationSetting(
    organization?.id || '',
  );

  // When moving to the next step, save the selected languages
  useImperativeHandle(ref, () => ({
    onNext: async () => {
      finishSetup();
      return true;
    },
  }));

  const finishSetup = () => {
    // Remember the skipping setup
    updateOrganizationSetting({
      type: 'user-setting',
      key: OrganizationSettingsKey.OrganizationSettingsKeyShowQuickSetup,
      value: 'false',
    });
  };

  return (
    <Stack spacing={4}>
      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.sheets.description')}
      </Typography>
      TODO
    </Stack>
  );
});

export default AutoSetupSheetStep;
