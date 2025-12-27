import React, { useEffect } from 'react';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme } from '@mui/material/styles';
import { useTranslation, Trans } from 'react-i18next';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { Checkbox, Link } from '@mui/material';
import { Api, OrganizationStatus } from '../../../api/ColabriAPI';
import { validate, CreateTrialFormEntries } from './CreateTrialFormValidate';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { useUserAuth } from '../../hooks/useUserAuth/useUserAuth';

const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

type ExtendedFormValues = CreateTrialFormEntries & {
  termsAccepted?: boolean;
};

export type CreateTrialFormProps = {
  onSuccess?: () => void;
};

const CreateTrialFormContent: React.FC<CreateTrialFormProps> = ({
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { isLoading, userAuth, error } = useUserAuth();
  const theme = useTheme();
  const notifications = useNotifications();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formValues, setFormValues] = React.useState<ExtendedFormValues>({});
  const [formErrors, setFormErrors] = React.useState<
    Partial<Record<keyof ExtendedFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Ref to track if user profile is fixed
  const isFixedUserProfileRef = React.useRef(false);

  useEffect(() => {
    if (!isLoading && userAuth) {
      setFormValues((prevValues) => ({
        ...prevValues,
        ownerEmail: userAuth.profile.email,
        ownerFirstName: userAuth.profile.firstName,
        ownerLastName: userAuth.profile.lastName,
      }));
      isFixedUserProfileRef.current = true;
    }
  }, [isLoading, userAuth]);

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof CreateTrialFormEntries;

    const newFormValues = {
      ...formValues,
      [fieldName]: value,
    };
    setFormValues(newFormValues);

    // Validate field on change
    const { issues } = validate(newFormValues, t);
    const fieldIssue = issues?.find((issue) => issue.path?.[0] === fieldName);

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: fieldIssue ? fieldIssue.message : undefined,
    }));
  };

  useEffect(() => {
    const checkName = async () => {
      if (!formValues.name || formValues.name.length < 3) return;
      if (!executeRecaptcha) return;

      // If there's already an error (e.g. too short), don't check
      if (formErrors.name) return;

      try {
        const token = await executeRecaptcha('check_name');
        if (!token) return;

        const response = await apiClient.trials.postTrialsCheckName({
          name: formValues.name,
          recaptchaToken: token,
        });

        if (response.data && response.data.available === false) {
          setFormErrors((prev) => ({
            ...prev,
            name: t('trial.validation.nameTaken'),
          }));
        }
      } catch (error) {
        console.error('Failed to check name availability', error);
      }
    };

    const timer = setTimeout(() => {
      checkName();
    }, 500);

    return () => clearTimeout(timer);
  }, [formValues.name, executeRecaptcha, t, formErrors.name]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      termsAccepted: event.target.checked,
    }));
    if (event.target.checked) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        termsAccepted: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    const { issues } = validate(formValues, t);
    const errors: Partial<Record<keyof ExtendedFormValues, string>> = {};

    if (issues && issues.length > 0) {
      issues.forEach((issue) => {
        if (issue.path?.[0]) {
          errors[issue.path[0] as keyof CreateTrialFormEntries] = issue.message;
        }
      });
    }

    if (!formValues.termsAccepted) {
      errors.termsAccepted = t('trial.termsRequired');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!executeRecaptcha) {
      notifications.show(t('trial.recaptchaError'), { severity: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await executeRecaptcha('create_trial');
      if (!token) {
        throw new Error('Recaptcha token not available');
      }

      await apiClient.trials.postTrial({
        name: formValues.name!,
        ownerEmail: formValues.ownerEmail!,
        ownerFirstName: formValues.ownerFirstName!,
        ownerLastName: formValues.ownerLastName!,
        recaptchaToken: token,
      });

      notifications.show(t('trial.createSuccess'), {
        severity: 'success',
        autoHideDuration: 5000,
      });

      // Redirect and clear form
      setFormValues({});
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notifications.show(
        t('trial.createError', { error: (error as Error).message }),
        {
          severity: 'error',
          autoHideDuration: 5000,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      <Stack spacing={4}>
        <Typography variant="h4">{t('trial.createTrialTitle')}</Typography>

        <FormGroup>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ mb: 2, width: '100%' }}>
            <TextField
              value={formValues.name ?? ''}
              onChange={handleTextFieldChange}
              name="name"
              label={t('common.companyName')}
              error={!!formErrors.name}
              helperText={formErrors.name ?? ' '}
              fullWidth
              disabled={isSubmitting}
            />
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
            <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
              <TextField
                value={formValues.ownerEmail ?? ''}
                onChange={handleTextFieldChange}
                name="ownerEmail"
                label={t('common.email')}
                error={!!formErrors.ownerEmail}
                helperText={formErrors.ownerEmail ?? ' '}
                fullWidth
                disabled={isSubmitting || isFixedUserProfileRef.current}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              <TextField
                value={formValues.ownerFirstName ?? ''}
                onChange={handleTextFieldChange}
                name="ownerFirstName"
                label={t('common.firstName')}
                error={!!formErrors.ownerFirstName}
                helperText={formErrors.ownerFirstName ?? ' '}
                fullWidth
                disabled={isSubmitting || isFixedUserProfileRef.current}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              <TextField
                value={formValues.ownerLastName ?? ''}
                onChange={handleTextFieldChange}
                name="ownerLastName"
                label={t('common.lastName')}
                error={!!formErrors.ownerLastName}
                helperText={formErrors.ownerLastName ?? ' '}
                fullWidth
                disabled={isSubmitting || isFixedUserProfileRef.current}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12 }}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <FormControlLabel
                required
                control={
                  <Checkbox
                    checked={formValues.termsAccepted ?? false}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                  />
                }
                label={
                  <Trans
                    i18nKey="trial.createTrialTermsAcceptance"
                    components={{
                      1: (
                        <Link
                          href="#/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontWeight: 'bold',
                          }}
                        />
                      ),
                      2: (
                        <Link
                          href="#/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontWeight: 'bold',
                          }}
                        />
                      ),
                    }}
                  />
                }
              />
              {formErrors.termsAccepted && (
                <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                  {formErrors.termsAccepted}
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
              <Button
                variant="outlined"
                fullWidth={true}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </Grid>
          </Grid>
        </FormGroup>
      </Stack>
    </Paper>
  );
};

const CreateTrialForm: React.FC<CreateTrialFormProps> = (props) => {
  const { i18n } = useTranslation();
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={window.gcpRecaptchaSiteKey}
      language={i18n.language}
    >
      <CreateTrialFormContent {...props} />
    </GoogleReCaptchaProvider>
  );
};

export default CreateTrialForm;
