import React from 'react';
import CreateTrialForm from './CreateTrialForm';
import MainFrame from '../../components/MainLayout/MainFrame';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Confetti from 'react-confetti';
import { useColorScheme } from '../../hooks/useColorScheme/useColorScheme';
import { useTheme } from '@mui/material/styles';
import { useTranslation, Trans } from 'react-i18next';
import { Organization } from '../../../api/ColabriAPI';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router';

const TrialPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode } = useColorScheme();
  const [created, setCreated] = React.useState(false);
  const [trialOrg, setTrialOrg] = React.useState<null | Organization>(null);
  const [requiresValidation, setRequiresValidation] = React.useState(false);
  const navigate = useNavigate();

  const handleSuccess = (org: Organization, requiresValidation: boolean) => {
    setCreated(true);
    setTrialOrg(org);
    setRequiresValidation(requiresValidation);
  };

  return (
    <MainFrame>
      {created ? (
        <>
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
              <Typography variant="h4">
                {t('trial.trialCreatedTitle')}
              </Typography>

              {!requiresValidation && (
                <>
                  <Typography variant="body2">
                    {t('trial.trialCreatedMessage')}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      navigate(`/org/${trialOrg?.id}/autosetup`);
                    }}
                  >
                    {t('trial.startUsingButton')}
                  </Button>
                </>
              )}
              {requiresValidation && (
                <>
                  <Typography variant="body2">
                    {t('trial.trialRequiresValidationMessage1')}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <img
                      src={
                        mode === 'dark'
                          ? '/signup-dark.png'
                          : '/signup-light.png'
                      }
                      alt="Check your email"
                      style={{
                        maxWidth: '400px',
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {t('trial.trialRequiresValidationMessage2')}
                  </Typography>
                </>
              )}
            </Stack>
          </Paper>
          <Confetti recycle={false} run={true} />
        </>
      ) : (
        <CreateTrialForm onSuccess={handleSuccess} />
      )}
    </MainFrame>
  );
};

export default TrialPage;
