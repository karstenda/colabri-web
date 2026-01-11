import { Alert, Stack, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export type ErrorPromptProps = {
  msg: string;
};

const ErrorPrompt: React.FC<ErrorPromptProps> = ({ msg }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'center', // Centers horizontally
        alignItems: 'center', // Centers vertically
        padding: theme.spacing(2),
        minWidth: 350,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h6" gutterBottom>
          {t('onboarding.errorPromptTitle')}
        </Typography>
        <Alert severity="error">
          {!msg || msg === '' ? t('onboarding.errorDefaultMsg') : msg}
        </Alert>
      </Stack>
    </Paper>
  );
};

export default ErrorPrompt;
