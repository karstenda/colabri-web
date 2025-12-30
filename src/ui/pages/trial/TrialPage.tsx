import React from 'react';
import CreateTrialForm from './CreateTrialForm';
import MainFrame from '../../components/MainLayout/MainFrame';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { useTranslation, Trans } from 'react-i18next';
import { Organization } from '../../../api/ColabriAPI';

const TrialPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [created, setCreated] = React.useState(false);
  const [trialOrg, setTrialOrg] = React.useState<null | Organization>(null);
  const [requiresValidation, setRequiresValidation] = React.useState(false);

  const handleSuccess = (org: Organization, requiresValidation: boolean) => {
    setCreated(true);
    setTrialOrg(org);
    setRequiresValidation(requiresValidation);
  };

  return (
    <MainFrame>
      {created ? (
        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'center', // Centers horizontally
            alignItems: 'center', // Centers vertically
            padding: theme.spacing(2),
            minWidth: 350,
            maxWidth: 800,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h4">{t('trial.trialCreatedTitle')}</Typography>
            <Typography variant="body2">
              <Trans
                i18nKey={
                  requiresValidation
                    ? 'trial.trialRequiresValidationMessage'
                    : 'trial.trialCreatedMessage'
                }
                components={{
                  1: (
                    <Link
                      href={'#/org/' + trialOrg?.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    />
                  ),
                }}
              />
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <CreateTrialForm onSuccess={handleSuccess} />
      )}
    </MainFrame>
  );
};

export default TrialPage;
