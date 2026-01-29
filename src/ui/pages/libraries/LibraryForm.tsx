import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import type { LibraryFormEntries } from './LibraryFormValidate';
import { DocumentType } from '../../../api/ColabriAPI';
import { FormHelperText, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

export type { LibraryFormEntries };

export interface LibraryFormState {
  values: LibraryFormEntries;
  errors: Partial<Record<keyof LibraryFormState['values'], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface LibraryFormProps {
  formMode: 'create' | 'edit';
  formState: LibraryFormState;
  onFieldChange: (
    name: keyof LibraryFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (formValues: Partial<LibraryFormState['values']>) => Promise<void>;
  onReset?: (formValues: Partial<LibraryFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function LibraryForm(props: LibraryFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const { t } = useTranslation();
  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const organization = useOrganization();

  const type = formValues.type;
  let displayType = '';
  if (type === DocumentType.DocumentTypeColabStatement) {
    displayType = t('statements.type');
  } else if (type === DocumentType.DocumentTypeColabSheet) {
    displayType = t('sheets.type');
  } else {
    displayType = type ? type : '';
  }

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
        event.target.name as keyof LibraryFormState['values'],
        event.target.value,
      );
    },
    [onFieldChange],
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof LibraryFormState['values'],
        event.target.value as FormFieldValue,
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
    navigate(backButtonPath ?? `/org/${organization?.id}/config/libraries`);
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
              error={!!formErrors.name}
              required
              id="name-input"
              name="name"
              label={t('common.name')}
              onChange={handleTextFieldChange}
              fullWidth
              helperText={formErrors.name ?? ' '}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            {props.formMode === 'create' && (
              <FormControl fullWidth>
                <InputLabel id="type-input-label">
                  {t('libraries.fields.type')}
                </InputLabel>
                <Select
                  value={formValues.type ?? ''}
                  error={!!formErrors.type}
                  required
                  labelId="type-input-label"
                  id="type-input"
                  name="type"
                  label={t('libraries.fields.type')}
                  onChange={handleSelectFieldChange}
                  fullWidth
                >
                  <MenuItem value={DocumentType.DocumentTypeColabStatement}>
                    {t('statements.type')}
                  </MenuItem>
                  <MenuItem value={DocumentType.DocumentTypeColabSheet}>
                    {t('sheets.type')}
                  </MenuItem>
                </Select>
                <FormHelperText>{formErrors.type ?? ' '}</FormHelperText>
              </FormControl>
            )}
            {props.formMode === 'edit' && (
              <TextField
                value={displayType}
                error={!!formErrors.type}
                required
                id="type-input"
                name="type"
                label={t('libraries.fields.type')}
                fullWidth
                disabled={props.formMode === 'edit'}
                helperText={formErrors.type ?? ' '}
              />
            )}
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {submitButtonLabel}
          </Button>
        </Stack>
      </FormGroup>
    </Box>
  );
}
