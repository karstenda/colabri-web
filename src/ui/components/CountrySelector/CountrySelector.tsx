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
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import { useTranslation } from 'react-i18next';
import type { OrgCountry, PlatformCountry } from '../../../api/ColabriAPI';
import {
  usePlatformCountries,
  useCountries as useOrgCountries,
} from '../../hooks/useCountries/useCountries';
import CountryChip from '../CountryChip/CountryChip';

export type CountryOption = OrgCountry | PlatformCountry;

const filter = createFilterOptions<CountryOption>();

const MORE_RESULTS_OPTION: PlatformCountry = {
  code: 'MORE_RESULTS',
  name: 'Type to see more results...',
};

export interface CountrySelectorProps {
  scope: 'platform' | 'organization';
  orgId?: string;
  multiple?: boolean;
  value?: string | string[] | CountryOption | CountryOption[] | null;
  onChange?: (value: CountryOption | CountryOption[] | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  filterOptions?: (options: CountryOption[]) => CountryOption[];
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
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

  const inputLabel = label ?? t('countries.selector.label');

  const { countries: platformCountries, isLoading: isPlatformLoading } =
    usePlatformCountries(scope === 'platform');

  const { countries: orgCountries, isLoading: isOrgLoading } = useOrgCountries(
    orgId || '',
    scope === 'organization' && !!orgId,
  );

  const allCountries = scope === 'platform' ? platformCountries : orgCountries;
  const countries = filterOptions ? filterOptions(allCountries) : allCountries;
  const isLoading = scope === 'platform' ? isPlatformLoading : isOrgLoading;

  const getCountryCode = (option: CountryOption): string => option.code || '';

  const getCountryName = (option: CountryOption): string => option.name || '';

  const findCountryByCode = (code: string): CountryOption | null =>
    countries.find((country) => getCountryCode(country) === code) || null;

  const normalizeValue = (
    val: string | CountryOption,
  ): CountryOption | null => {
    if (typeof val === 'string') {
      return findCountryByCode(val);
    }
    return val;
  };

  const selectedValue = React.useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return values.map(normalizeValue).filter(Boolean) as CountryOption[];
    }
    if (!value) return null;
    if (Array.isArray(value)) return null;
    return normalizeValue(value);
  }, [value, countries, multiple]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: CountryOption | CountryOption[] | null,
  ) => {
    if (!onChange) return;

    if (multiple) {
      const options = Array.isArray(newValue) ? newValue : [];
      const validCountries = options.filter(
        (country) => country.code !== MORE_RESULTS_OPTION.code,
      );
      onChange(validCountries);
    } else {
      const country = newValue as CountryOption | null;
      if (country && country.code === MORE_RESULTS_OPTION.code) {
        return;
      }
      onChange(country);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      value={selectedValue}
      onChange={handleChange}
      options={countries}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        if (filtered.length > 50) {
          return [...filtered.slice(0, 50), MORE_RESULTS_OPTION];
        }
        return filtered;
      }}
      getOptionLabel={getCountryName}
      isOptionEqualToValue={(option, value) => {
        if (option.code === MORE_RESULTS_OPTION.code) return false;
        return getCountryCode(option) === getCountryCode(value);
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
        const { key, ...optionProps } = props;
        if (option.code === MORE_RESULTS_OPTION.code) {
          return (
            <Box
              component="li"
              key={key}
              {...optionProps}
              sx={{
                justifyContent: 'center',
                color: 'text.secondary',
                fontStyle: 'italic',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="body2">
                {t('countries.selector.moreResults')}
              </Typography>
            </Box>
          );
        }
        return (
          <Box
            component="li"
            key={key}
            {...optionProps}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.grey[400],
              }}
            >
              <FlagCircleIcon fontSize="small" />
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
              <CountryChip
                key={option.code || index}
                country={option}
                onDelete={onDelete}
                chipProps={other}
              />
            );
          });
        }

        const singleValue = Array.isArray(selected) ? selected[0] : selected;
        return getCountryName(singleValue);
      }}
      noOptionsText={
        isLoading ? t('common.loading') : t('countries.selector.noOptions')
      }
    />
  );
};

export default CountrySelector;
