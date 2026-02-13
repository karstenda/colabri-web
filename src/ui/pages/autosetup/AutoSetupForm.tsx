import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';
import { useState, useRef } from 'react';
import { AutoSetupFormData } from './AutoSetupData';
import AutoSetupCountriesStep, {
  AutoSetupCountriesStepRef,
} from './steps/AutoSetupCountriesStep';
import AutoSetupLanguageStep, {
  AutoSetupLanguageStepRef,
} from './steps/AutoSetupLanguageStep';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AutoSetupProductStep, {
  AutoSetupProductStepRef,
} from './steps/AutoSetupProductStep';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import AutoSetupSheetStep, {
  AutoSetupSheetStepRef,
} from './steps/AutoSetupSheetStep';
import AutoSetupSummaryStep from './steps/AutoSetupSummaryStep';

const AutoSetupForm = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useTranslation();
  const notifications = useNotifications();
  const compactView = useMediaQuery('(max-width:800px)');

  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();
  const countriesStepRef = useRef<AutoSetupCountriesStepRef>(null);
  const languageStepRef = useRef<AutoSetupLanguageStepRef>(null);
  const productStepRef = useRef<AutoSetupProductStepRef>(null);
  const sheetStepRef = useRef<AutoSetupSheetStepRef>(null);

  const [setupFormData, setSetupFormData] = useState<AutoSetupFormData>({
    countries: [],
    languages: [],
    product: {},
    sheet: {},
  });

  const steps = [
    t('autosetup.step1'),
    t('autosetup.step2'),
    t('autosetup.step3'),
    t('autosetup.step4'),
  ];

  const onBack = () => {
    if (activeStep === 0) {
      onCancel();
    } else {
      setActiveStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const onNext = async () => {
    let continueNext: boolean | undefined = true;
    if (activeStep === 0) {
      continueNext = await countriesStepRef.current?.onNext();
    }
    if (activeStep === 1) {
      continueNext = await languageStepRef.current?.onNext();
    }
    if (activeStep === 2) {
      continueNext = await productStepRef.current?.onNext();
    }
    if (activeStep === 3) {
      continueNext = await sheetStepRef.current?.onNext();
    }

    if (continueNext) {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <Stack
      spacing={2}
      sx={{ width: compactView ? '100%' : '750px', margin: 'auto' }}
    >
      <Typography variant="h4">{t('autosetup.title')}</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {!compactView && (
          <Box
            sx={{
              width: 200,
              flexGrow: 0,
              paddingRight: '24px',
              borderRight: '1px solid',
              borderColor: (theme.vars || theme).palette.divider,
            }}
          >
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
        <Box
          sx={{
            flexGrow: 1,
            paddingLeft: compactView ? '0px' : '24px',
            flexDirection: 'column',
            display: 'flex',
            gap: 4,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {activeStep === 0 && (
              <AutoSetupCountriesStep
                ref={countriesStepRef}
                setupFormData={setupFormData}
                setSetupFormData={setSetupFormData}
              />
            )}
            {activeStep === 1 && (
              <AutoSetupLanguageStep
                ref={languageStepRef}
                setupFormData={setupFormData}
                setSetupFormData={setSetupFormData}
              />
            )}
            {activeStep === 2 && (
              <AutoSetupProductStep
                ref={productStepRef}
                setupFormData={setupFormData}
                setSetupFormData={setSetupFormData}
              />
            )}
            {activeStep === 3 && (
              <AutoSetupSheetStep
                ref={sheetStepRef}
                setupFormData={setupFormData}
                setSetupFormData={setSetupFormData}
              />
            )}
            {activeStep === 4 && (
              <AutoSetupSummaryStep
                setupFormData={setupFormData}
                setSetupFormData={setSetupFormData}
              />
            )}
          </Box>

          {activeStep < steps.length && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexGrow: 0,
                flexDirection: 'row',
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                }}
              >
                <Button variant="contained" color="secondary" onClick={onBack}>
                  {t('common.back')}
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
                <Button variant="contained" color="primary" onClick={onNext}>
                  {t('common.next')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default AutoSetupForm;
