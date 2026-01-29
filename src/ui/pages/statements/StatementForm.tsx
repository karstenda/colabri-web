import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import {
  ColabModelType,
  ColabStatementModel,
  DocumentType,
  type StatementDocument,
} from '../../../api/ColabriAPI';
import { ContentTypeSelector } from '../../components/ContentTypeSelector';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useTheme } from '@mui/material/styles';

export type StatementFormEntries = {
  contentType?: string;
  name?: string;
};

export interface StatementFormState {
  values: StatementFormEntries;
  errors: Partial<Record<keyof StatementFormState['values'], string>>;
}

export type FormFieldValue =
  | string
  | string[]
  | number
  | boolean
  | ColabStatementModel
  | null;

export interface StatementFormProps {
  formMode: 'create' | 'edit';
  formState: StatementFormState;
  onFieldChange: (
    name: keyof StatementFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (
    formValues: Partial<StatementFormState['values']>,
  ) => Promise<void>;
  onReset?: (formValues: Partial<StatementFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function StatementForm(props: StatementFormProps) {
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
        event.target.name as keyof StatementFormState['values'],
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
    navigate(backButtonPath ?? '/statements');
  }, [navigate, backButtonPath]);

  const onContentTypeChange = React.useCallback(
    (newValue: string | string[] | null) => {
      if (!newValue || Array.isArray(newValue)) {
        return;
      }
      onFieldChange('contentType', newValue);
    },
    [onFieldChange],
  );

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
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <ContentTypeSelector
              value={formValues.contentType ?? ''}
              orgId={organization?.id ?? ''}
              multiple={false}
              onChange={onContentTypeChange}
              docTypeFilter={DocumentType.DocumentTypeColabStatement}
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
