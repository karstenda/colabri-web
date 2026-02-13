import { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../../../../components/LanguageSelector';
import { CountrySelector } from '../../../../components/CountrySelector';
import { useOrganization } from '../../../../context/UserOrganizationContext/UserOrganizationProvider';
import { ContentLanguage } from '../../../../../editor/data/ContentLanguage';
import { OrgCountry } from '../../../../../api/ColabriAPI';

export type AutoSetupSheetFormEntries = {
  name?: string;
  languages?: ContentLanguage[];
  masterLanguage?: ContentLanguage | null;
  countries?: OrgCountry[];
};

export interface AutoSetupSheetFormState {
  values: AutoSetupSheetFormEntries;
  errors: {
    name?: string;
    languages?: string;
    masterLanguage?: string;
    countries?: string;
  };
}

export type FormFieldValue =
  | string
  | ContentLanguage
  | ContentLanguage[]
  | OrgCountry
  | OrgCountry[]
  | null;

type AutoSetupSheetFormProps = {
  formState: AutoSetupSheetFormState;
  onFieldChange: (
    name: keyof AutoSetupSheetFormState['values'],
    value: FormFieldValue,
  ) => void;
  isSubmitting?: boolean;
};

const AutoSetupSheetForm = ({
  formState,
  onFieldChange,
  isSubmitting,
}: AutoSetupSheetFormProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const organization = useOrganization();

  const selectedLanguageCodes = useMemo(
    () => new Set((formState.values.languages ?? []).map((l) => l.code)),
    [formState.values.languages],
  );

  const handleLanguagesChange = useCallback(
    (value: ContentLanguage | ContentLanguage[] | null) => {
      const languages = Array.isArray(value) ? value : value ? [value] : [];

      onFieldChange('languages', languages);

      if (
        formState.values.masterLanguage &&
        !languages.some(
          (lang) => lang.code === formState.values.masterLanguage?.code,
        )
      ) {
        onFieldChange('masterLanguage', null);
      }
    },
    [onFieldChange, formState.values.masterLanguage],
  );

  const handleMasterLanguageChange = useCallback(
    (value: ContentLanguage | ContentLanguage[] | null) => {
      const masterLanguage = Array.isArray(value)
        ? (value[0] ?? null)
        : (value ?? null);
      onFieldChange('masterLanguage', masterLanguage);
    },
    [onFieldChange],
  );

  const handleTextFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof AutoSetupSheetFormState['values'],
        event.target.value,
      );
    },
    [onFieldChange],
  );

  const handleCountriesChange = useCallback(
    (value: OrgCountry | OrgCountry[] | null) => {
      const countries = Array.isArray(value) ? value : value ? [value] : [];
      onFieldChange('countries', countries);
    },
    [onFieldChange],
  );

  return (
    <Box>
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <TextField
              value={formState.values.name ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="name"
              label={t('common.name')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.name}
              helperText={formState.errors.name ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <LanguageSelector
              value={formState.values.languages ?? []}
              orgId={organization?.id ?? ''}
              scope="organization"
              multiple={true}
              label={t('languages.title')}
              disabled={isSubmitting}
              onChange={handleLanguagesChange}
              error={!!formState.errors.languages}
              helperText={formState.errors.languages ?? ' '}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <LanguageSelector
              value={formState.values.masterLanguage ?? null}
              orgId={organization?.id ?? ''}
              scope="organization"
              multiple={false}
              label={t('languages.masterLanguage')}
              disabled={isSubmitting}
              onChange={handleMasterLanguageChange}
              error={!!formState.errors.masterLanguage}
              helperText={formState.errors.masterLanguage ?? ' '}
              filterOptions={(options) =>
                options.filter((option) =>
                  selectedLanguageCodes.has(option.code),
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <CountrySelector
              value={formState.values.countries ?? []}
              orgId={organization?.id ?? ''}
              scope="organization"
              multiple={true}
              label={t('countries.title')}
              disabled={isSubmitting}
              onChange={handleCountriesChange}
              error={!!formState.errors.countries}
              helperText={formState.errors.countries ?? ' '}
            />
          </Grid>
        </Grid>
      </FormGroup>
    </Box>
  );
};

export default AutoSetupSheetForm;
