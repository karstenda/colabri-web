import { Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AutoSetupSheetLoader = ({
  sheetName,
  completed,
}: {
  sheetName: string;
  completed: boolean;
}) => {
  const { t } = useTranslation();
  const messages = useMemo(
    () => [
      t('autosetup.steps.sheets.loading.m1', { sheetName }),
      t('autosetup.steps.sheets.loading.m2', { sheetName }),
      t('autosetup.steps.sheets.loading.m3', { sheetName }),
      t('autosetup.steps.sheets.loading.m4', { sheetName }),
      t('autosetup.steps.sheets.loading.m5', { sheetName }),
      t('autosetup.steps.sheets.loading.m6', { sheetName }),
      t('autosetup.steps.sheets.loading.m7', { sheetName }),
      t('autosetup.steps.sheets.loading.m8', { sheetName }),
      t('autosetup.steps.sheets.loading.m9', { sheetName }),
      t('autosetup.steps.sheets.loading.m10', { sheetName }),
      t('autosetup.steps.sheets.loading.m11', { sheetName }),
      t('autosetup.steps.sheets.loading.m12', { sheetName }),
      t('autosetup.steps.sheets.loading.m13', { sheetName }),
      t('autosetup.steps.sheets.loading.m14', { sheetName }),
    ],
    [sheetName, t],
  );

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [messages.length]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        margin: '0 auto',
        padding: '16px',
      }}
    >
      <Typography variant="h6" style={{ textAlign: 'center' }}>
        {t('autosetup.steps.sheets.loading.title')}
      </Typography>
      <Typography variant="caption" style={{ textAlign: 'center' }}>
        {completed
          ? t('autosetup.steps.sheets.loading.completed', { sheetName })
          : messages[messageIndex]}
      </Typography>
      <LinearProgress
        aria-label="Auto setup loading"
        variant={completed ? 'determinate' : 'indeterminate'}
        value={completed ? 100 : undefined}
        sx={{
          width: '100%',
          height: 10,
          borderRadius: 999,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
          },
        }}
      />
    </div>
  );
};

export default AutoSetupSheetLoader;
