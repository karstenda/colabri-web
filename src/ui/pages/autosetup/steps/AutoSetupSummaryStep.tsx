import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useUpdateOrganizationSetting } from '../../../hooks/useOrganizationSettings/useOrganizationSettings';
import { OrganizationSettingsKey } from '../../../../api/ColabriAPI';
import { AutoSetupFormData } from '../AutoSetupData';
import { useOrganization } from '../../../context/UserOrganizationContext/UserOrganizationProvider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type AutoSetupSummaryStepProps = {
  setupFormData: AutoSetupFormData;
  setSetupFormData: React.Dispatch<React.SetStateAction<AutoSetupFormData>>;
};

const AutoSetupSummaryStep = ({
  setupFormData,
  setSetupFormData,
}: AutoSetupSummaryStepProps) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const navigate = useNavigate();
  const { updateOrganizationSetting } = useUpdateOrganizationSetting(
    organization?.id || '',
  );

  const finishSetup = async () => {
    // Remember the skipping setup
    await updateOrganizationSetting({
      type: 'user-setting',
      key: OrganizationSettingsKey.OrganizationSettingsKeyShowQuickSetup,
      value: 'false',
    });
    // Navigate back to the home page of the organization
    navigate(`/org/${organization?.id}`);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" style={{ textAlign: 'center' }}>
        {t('autosetup.steps.summary.title')}
      </Typography>

      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.summary.description1')}
      </Typography>
      <Typography variant="body2" gutterBottom>
        <b>{setupFormData.sheet?.name}</b>
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.summary.description2')}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.summary.description3')}
      </Typography>

      <Button onClick={finishSetup} variant="contained">
        {t('autosetup.steps.summary.button')}
      </Button>
    </Stack>
  );
};

export default AutoSetupSummaryStep;
