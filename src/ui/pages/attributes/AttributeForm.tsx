import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import type { Attribute } from '../../../api/ColabriAPI';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useTheme } from '@mui/material/styles';

export type AttributeFormEntries = Partial<
  Omit<Attribute, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
>;

export interface AttributeFormState {
  values: AttributeFormEntries;
  errors: Partial<Record<keyof AttributeFormState['values'], string>>;
}

export type FormFieldValue = string | Record<string, any> | null;

export interface AttributeFormProps {
  formMode: 'create' | 'edit';
  formState: AttributeFormState;
  onFieldChange: (
    name: keyof AttributeFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (
    formValues: Partial<AttributeFormState['values']>,
  ) => Promise<void>;
  onReset?: (formValues: Partial<AttributeFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function AttributeForm(props: AttributeFormProps) {
  const {
    formMode,
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
        event.target.name as keyof AttributeFormState['values'],
        event.target.value,
      );
    },
    [onFieldChange],
  );

  const handleSelectChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof AttributeFormState['values'],
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
    navigate(backButtonPath ?? `/org/${organization?.id}/attributes`);
  }, [navigate, backButtonPath, organization]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ marginTop: '16px', marginBottom: '16px', width: '100%' }}
    >
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
        <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
          <FormControl fullWidth error={!!formErrors.type}>
            <InputLabel id="attribute-type-label">Type</InputLabel>
            <Select
              labelId="attribute-type-label"
              id="attribute-type"
              value={formValues.type ?? ''}
              label="Type"
              name="type"
              onChange={handleSelectChange}
              disabled={isSubmitting || formMode === 'edit'}
            >
              <MenuItem value="string">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
            <FormHelperText>{formErrors.type ?? ' '}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
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
