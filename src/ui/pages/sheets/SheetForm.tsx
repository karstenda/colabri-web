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
  ColabSheetModel,
  OrgCountry,
  OrgProduct,
} from '../../../api/ColabriAPI';
import { ContentTypeSelector } from '../../components/ContentTypeSelector';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { CountrySelector } from '../../components/CountrySelector';
import { LanguageSelector } from '../../components/LanguageSelector';
import { ContentLanguage } from '../../../editor/data/ContentLanguage';

export type SheetFormEntries = {
  name?: string;
  countries?: OrgCountry[];
  languages?: ContentLanguage[];
  product?: OrgProduct;
};

export interface SheetFormState {
  values: SheetFormEntries;
  errors: Partial<Record<keyof SheetFormState['values'], string>>;
}

export type FormFieldValue =
  | string
  | string[]
  | number
  | boolean
  | ColabSheetModel
  | OrgProduct
  | OrgCountry[]
  | ContentLanguage[]
  | null;

export interface SheetFormProps {
  formMode: 'create' | 'edit';
  formState: SheetFormState;
  onFieldChange: (
    name: keyof SheetFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (formValues: Partial<SheetFormState['values']>) => Promise<void>;
  onReset?: (formValues: Partial<SheetFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function SheetForm(props: SheetFormProps) {
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
        event.target.name as keyof SheetFormState['values'],
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
    navigate(backButtonPath ?? '/sheets');
  }, [navigate, backButtonPath]);

  const onProductChange = React.useCallback(
    (newValue: OrgProduct | null) => {
      onFieldChange('product', newValue);
    },
    [onFieldChange],
  );

  const onCountryChange = React.useCallback(
    (newValue: OrgCountry[] | null) => {
      onFieldChange('countries', newValue);
    },
    [onFieldChange],
  );

  const onLanguageChange = React.useCallback(
    (newValue: ContentLanguage[] | null) => {
      onFieldChange('languages', newValue);
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
      sx={{ width: '100%' }}
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
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <CountrySelector
              value={formValues.countries ?? []}
              orgId={organization?.id ?? ''}
              multiple={true}
              onChange={(args) => {
                let countries;
                if (!Array.isArray(args) && args != null) {
                  countries = [args]; // Ensure it's an array
                } else {
                  countries = args;
                }
                onCountryChange(countries);
              }}
              scope="organization"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <LanguageSelector
              value={formValues.languages ?? []}
              orgId={organization?.id ?? ''}
              multiple={true}
              onChange={(args) => {
                let languages;
                if (!Array.isArray(args) && args != null) {
                  languages = [args]; // Ensure it's an array
                } else {
                  languages = args;
                }
                onLanguageChange(languages);
              }}
              scope="organization"
            />
          </Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
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
