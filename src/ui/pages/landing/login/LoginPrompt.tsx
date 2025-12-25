import { Stack, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import ColabriSvgIcon from '../../../components/MainLayout/icons/ColabriSvgIcon';

const LoginPrompt: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const onLoginClick = () => {
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'center', // Centers horizontally
        alignItems: 'center', // Centers vertically
        padding: theme.spacing(2),
        minWidth: 400,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4">{t('onboarding.loginPromptTitle')}</Typography>
        <Typography variant="body1">{t('onboarding.loginPrompt')}</Typography>
        <Button variant="contained" href="#/login" onClick={onLoginClick}>
          {t('onboarding.loginButton')}
        </Button>
      </Stack>
    </Paper>
  );
};

export default LoginPrompt;
