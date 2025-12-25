import React from 'react';
import CreateTrialForm from './CreateTrialForm';
import MainFrame from '../../components/MainLayout/MainFrame';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useTranslation, Trans } from 'react-i18next';

const TrialPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [created, setCreated] = React.useState(false);

  const handleSuccess = () => {
    setCreated(true);
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
            minWidth: 400,
            maxWidth: 800,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h4">{t('trial.trialCreatedTitle')}</Typography>
            <Typography variant="body2">
              {t('trial.trialCreatedMessage')}
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
