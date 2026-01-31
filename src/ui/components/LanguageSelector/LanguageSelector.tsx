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
import { createFilterOptions } from '@mui/material/Autocomplete';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import {
  usePlatformContentLanguages,
  useContentLanguages,
} from '../../hooks/useContentLanguages/useContentLanguage';
import {
  ContentLanguageDirection,
  type OrgContentLanguage,
  type PlatformContentLanguage,
} from '../../../api/ColabriAPI';
import LanguageChip from '../LanguageChip/LanguageChip';
import { ContentLanguage } from '../../../editor/data/ContentLanguage';

const filter = createFilterOptions<ContentLanguage>();

const MORE_RESULTS_OPTION: PlatformContentLanguage = {
  code: 'MORE_RESULTS',
  name: 'Type to see more results...',
  countryCode: '',
  defaultFont: [],
  langCode: '',
  spellCheck: false,
  spellCheckLangCode: '',
  textDirection: 'ltr' as ContentLanguageDirection,
};

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
  value?: string | string[] | ContentLanguage | ContentLanguage[] | null;
  onChange?: (value: ContentLanguage | ContentLanguage[] | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;

  /**
   * Optional function to filter available options
   */
  filterOptions?: (options: ContentLanguage[]) => ContentLanguage[];
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  scope,
  orgId,
  multiple = false,
  value = multiple ? [] : null,
  onChange,
  label,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  filterOptions,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const inputLabel = label ?? t('languages.selector.label');

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
  const getLanguageCode = (option: ContentLanguage): string => {
    return option.code || '';
  };

  // Get language name for display
  const getLanguageName = (option: ContentLanguage): string => {
    if (option.code === MORE_RESULTS_OPTION.code) {
      return '';
    }
    if ('endonym' in option && option.endonym) {
      return `${option.name} (${option.endonym})`;
    }
    return option.name || '';
  };

  // Find language by code
  const findLanguageByCode = (code: string): ContentLanguage | null => {
    return languages.find((lang) => getLanguageCode(lang) === code) || null;
  };

  // Helper to convert string or object to ContentLanguage
  const normalizeValue = (
    val: string | ContentLanguage,
  ): ContentLanguage | null => {
    if (typeof val === 'string') {
      return findLanguageByCode(val);
    }
    return val;
  };

  // Convert value to internal format
  const selectedValue = React.useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return values.map(normalizeValue).filter(Boolean) as ContentLanguage[];
    } else {
      if (!value) return null;
      if (Array.isArray(value)) return null; // Invalid case
      return normalizeValue(value);
    }
  }, [value, languages, multiple]);

  // Handle change
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: ContentLanguage | ContentLanguage[] | null,
  ) => {
    if (!onChange) return;

    if (multiple) {
      const languages = Array.isArray(newValue) ? newValue : [];
      const validLanguages = languages.filter(
        (l) => l.code !== MORE_RESULTS_OPTION.code,
      );
      onChange(validLanguages);
    } else {
      const val = newValue as ContentLanguage | null;
      if (val && val.code === MORE_RESULTS_OPTION.code) {
        return;
      }
      onChange(val);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      value={selectedValue}
      onChange={handleChange}
      options={languages}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        if (filtered.length > 50) {
          return [...filtered.slice(0, 50), MORE_RESULTS_OPTION];
        }
        return filtered;
      }}
      getOptionLabel={getLanguageName}
      isOptionEqualToValue={(option, value) => {
        if (option.code === MORE_RESULTS_OPTION.code) return false;
        return getLanguageCode(option) === getLanguageCode(value);
      }}
      loading={isLoading}
      disabled={disabled}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-inputRoot': {
          flexWrap: 'wrap',
          gap: 0.5,
        },
        '& .MuiInputBase-root': {
          height: 'auto',
          padding: '2px',
        },
        '& .MuiInputBase-input': {
          paddingTop: '4px !important',
          paddingBottom: '4px !important',
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
          label={inputLabel}
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
        const { key, ...otherProps } = props;
        if (option.code === MORE_RESULTS_OPTION.code) {
          return (
            <Box
              component="li"
              key={key}
              {...otherProps}
              sx={{
                justifyContent: 'center',
                color: 'text.secondary',
                fontStyle: 'italic',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="body2">
                {t('languages.selector.moreResults')}
              </Typography>
            </Box>
          );
        }
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
      renderValue={(selected, getItemProps) => {
        if (!selected) return null;

        if (multiple && Array.isArray(selected)) {
          return selected.map((option, index) => {
            const { onDelete, ...other } = getItemProps({ index });
            return (
              <LanguageChip
                key={option.code || index}
                language={option}
                onDelete={onDelete}
                chipProps={other}
              />
            );
          });
        }

        const singleValue = Array.isArray(selected) ? selected[0] : selected;
        return getLanguageName(singleValue);
      }}
      noOptionsText={
        isLoading ? t('common.loading') : t('languages.selector.noOptions')
      }
    />
  );
};

export default LanguageSelector;
