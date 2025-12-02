import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Avatar,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import {
  usePlatformContentLanguages,
  useContentLanguages,
} from '../../hooks/useContentLanguages/useContentLanguage';
import type {
  OrgContentLanguage,
  PlatformContentLanguage,
} from '../../../api/ColabriAPI';
import LanguageChip from '../LanguageChip/LanguageChip';

export type LanguageOption = OrgContentLanguage | PlatformContentLanguage;

interface LanguageSelectorProps {
  /**
   * The scope of languages to display
   * - 'platform': All platform languages
   * - 'organization': Organization-specific languages
   */
  scope: 'platform' | 'organization';

  /**
   * Organization ID (required when scope is 'organization')
   */
  orgId?: string;

  /**
   * Whether to allow multiple language selection
   */
  multiple?: boolean;

  /**
   * Current selected value(s)
   * - Single value when multiple=false (string code or language object)
   * - Array of values when multiple=true (string codes or language objects)
   */
  value?: string | string[] | LanguageOption | LanguageOption[] | null;

  /**
   * Callback when selection changes
   */
  onChange?: (
    value: string | string[] | LanguageOption | LanguageOption[] | null,
  ) => void;

  /**
   * Label for the input field
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Helper text to display below the field
   */
  helperText?: string;

  /**
   * Optional function to filter available options
   */
  filterOptions?: (options: LanguageOption[]) => LanguageOption[];
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  scope,
  orgId,
  multiple = false,
  value = multiple ? [] : null,
  onChange,
  label = 'Select Language',
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  filterOptions,
}) => {
  const theme = useTheme();

  // Fetch languages based on scope
  const { languages: platformLanguages, isLoading: isPlatformLoading } =
    usePlatformContentLanguages(scope === 'platform');

  const { languages: orgLanguages, isLoading: isOrgLoading } =
    useContentLanguages(orgId || '', scope === 'organization' && !!orgId);

  // Determine which languages to use
  const allLanguages = scope === 'platform' ? platformLanguages : orgLanguages;
  const languages = filterOptions ? filterOptions(allLanguages) : allLanguages;
  const isLoading = scope === 'platform' ? isPlatformLoading : isOrgLoading;

  // Get language code from option
  const getLanguageCode = (option: LanguageOption): string => {
    return option.code || '';
  };

  // Get language name for display
  const getLanguageName = (option: LanguageOption): string => {
    if ('endonym' in option && option.endonym) {
      return `${option.name} (${option.endonym})`;
    }
    return option.name || '';
  };

  // Find language by code
  const findLanguageByCode = (code: string): LanguageOption | null => {
    return languages.find((lang) => getLanguageCode(lang) === code) || null;
  };

  // Helper to convert string or object to LanguageOption
  const normalizeValue = (
    val: string | LanguageOption,
  ): LanguageOption | null => {
    if (typeof val === 'string') {
      return findLanguageByCode(val);
    }
    return val;
  };

  // Convert value to internal format
  const selectedValue = React.useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return values.map(normalizeValue).filter(Boolean) as LanguageOption[];
    } else {
      if (!value) return null;
      if (Array.isArray(value)) return null; // Invalid case
      return normalizeValue(value);
    }
  }, [value, languages, multiple]);

  // Handle change
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: LanguageOption | LanguageOption[] | null,
  ) => {
    if (!onChange) return;

    if (multiple) {
      const languages = Array.isArray(newValue) ? newValue : [];
      onChange(languages);
    } else {
      onChange(newValue as LanguageOption | null);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      value={selectedValue}
      onChange={handleChange}
      options={languages}
      getOptionLabel={getLanguageName}
      isOptionEqualToValue={(option, value) =>
        getLanguageCode(option) === getLanguageCode(value)
      }
      loading={isLoading}
      disabled={disabled}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-inputRoot': {
          alignContent: 'center',
        },
      }}
      slotProps={{
        paper: {
          sx: {
            border: '1px solid',
            borderColor: (theme.vars || theme).palette.divider,
            boxShadow: (theme.vars || theme).shadows[3],
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        return (
          <Box
            component="li"
            {...props}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.grey[400],
              }}
            >
              <LanguageIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body1">{option.name}</Typography>
            </Box>
          </Box>
        );
      }}
      renderValue={(selected) => {
        if (!selected) return '';

        if (multiple) {
          const selectedArray = Array.isArray(selected) ? selected : [selected];
          return (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {selectedArray.map((option) => (
                <LanguageChip
                  key={`${option.code}-${option.name}`}
                  language={option}
                />
              ))}
            </Box>
          );
        }

        const singleValue = Array.isArray(selected) ? selected[0] : selected;
        return getLanguageName(singleValue);
      }}
      noOptionsText={isLoading ? 'Loading...' : 'No languages found'}
    />
  );
};

export default LanguageSelector;
