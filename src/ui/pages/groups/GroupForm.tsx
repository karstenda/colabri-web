import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import type { GroupFormEntries } from './GroupFormValidate';
import { useTheme } from '@mui/material/styles';

export type { GroupFormEntries };

export interface GroupFormState {
  values: GroupFormEntries;
  errors: Partial<Record<keyof GroupFormState['values'], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface GroupFormProps {
  formMode: 'create' | 'edit';
  formState: GroupFormState;
  onFieldChange: (
    name: keyof GroupFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (formValues: Partial<GroupFormState['values']>) => Promise<void>;
  onReset?: (formValues: Partial<GroupFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function GroupForm(props: GroupFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();
  const theme = useTheme();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const organization = useOrganization();

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit],
  );

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof GroupFormState['values'],
        event.target.value,
      );
    },
    [onFieldChange],
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? `/org/${organization?.id}/groups`);
  }, [navigate, backButtonPath, organization?.id]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ marginTop: '16px', marginBottom: '16px', width: '100%' }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.name ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="name"
              label="Name"
              error={!!formErrors.name}
              helperText={formErrors.name ?? ' '}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.description ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="description"
              label="Description"
              error={!!formErrors.description}
              helperText={formErrors.description ?? ' '}
              fullWidth
              rows={4}
              placeholder="Optional description for this group..."
            />
          </Grid>
        </Grid>
      </FormGroup>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ marginTop: theme.spacing(2) }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}
