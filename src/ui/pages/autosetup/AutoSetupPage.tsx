import Box from '@mui/material/Box';
import MainFrame from '../../components/MainLayout/MainFrame';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import { useState } from 'react';
import {
  useIsOrgAdmin,
  useOrganization,
} from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useNavigate } from 'react-router';
import { useUpdateOrganizationSetting } from '../../hooks/useOrganizationSettings/useOrganizationSettings';
import { OrganizationSettingsKey } from '../../../api/ColabriAPI';
import AutoSetupForm from './AutoSetupForm';

const AutoSetupPage: React.FC = () => {
  const theme = useTheme();
  const organization = useOrganization();
  const isOrgAdmin = useIsOrgAdmin();
  const { confirm } = useDialogs();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateOrganizationSetting } = useUpdateOrganizationSetting(
    organization?.id!,
  );

  const [showAutoSetupForm, setShowAutoSetupForm] = useState(false);

  const onSkipSetup = () => {
    confirm(t('autosetup.skipWarning')).then(async (confirmed) => {
      if (confirmed) {
        // Remember the skipping setup
        await updateOrganizationSetting({
          type: 'user-setting',
          key: OrganizationSettingsKey.OrganizationSettingsKeyShowQuickSetup,
          value: 'false',
        });
        // Navigate back to the home page of the organization
        navigate(`/org/${organization?.id}`);
      }
    });
  };

  return (
    <MainFrame>
      <Paper
        sx={{
          display: 'flex',
          justifyContent: 'center', // Centers horizontally
          alignItems: 'center', // Centers vertically
          padding: theme.spacing(2),
          minWidth: 350,
          maxWidth: showAutoSetupForm ? 800 : 600,
        }}
      >
        {!isOrgAdmin && (
          <Stack spacing={2}>
            <Typography variant="h4">{t('autosetup.title')}</Typography>
            <Typography variant="body2">{t('autosetup.noAdmin')}</Typography>
          </Stack>
        )}
        {isOrgAdmin && !showAutoSetupForm && (
          <Stack spacing={2}>
            <Typography variant="h4">{t('autosetup.title')}</Typography>
            <Typography variant="body2">{t('autosetup.intro')}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onSkipSetup}
                >
                  {t('autosetup.skipSetup')}
                </Button>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowAutoSetupForm(true)}
                >
                  {t('autosetup.startSetup')}
                </Button>
              </Box>
            </Box>
          </Stack>
        )}
        {isOrgAdmin && showAutoSetupForm && (
          <AutoSetupForm onCancel={() => setShowAutoSetupForm(false)} />
        )}
      </Paper>
    </MainFrame>
  );
};

export default AutoSetupPage;
