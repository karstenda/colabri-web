import React, { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import type { GPCNode } from '../../../api/ColabriAPI';
import { useGPCNodes } from '../../hooks/useGPC/useGPC';

// Define the filter options
const filter = createFilterOptions<GPCNode>();

const MORE_RESULTS_OPTION: GPCNode = {
  code: 'MORE_RESULTS',
  description: 'Type to see more results...',
};

export interface GPCSelectorProps {
  gpcScope:
    | 'gpcSegment'
    | 'gpcFamily'
    | 'gpcClass'
    | 'gpcBrick'
    | 'gpcAttribute'
    | 'gpcValue';
  gpcSegmentCode?: string;
  gpcFamilyCode?: string;
  gpcClassCode?: string;
  gpcBrickCode?: string;
  gpcAttributeCode?: string;
  gpcValueCode?: string;
  value?: string | GPCNode | null;
  onChange?: (value: string | GPCNode | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  filterOptions?: (options: GPCNode[]) => GPCNode[];
}

export const GPCSelector: React.FC<GPCSelectorProps> = ({
  gpcScope,
  gpcSegmentCode,
  gpcFamilyCode,
  gpcClassCode,
  gpcBrickCode,
  gpcAttributeCode,
  gpcValueCode,
  value = null,
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

  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const { nodes, isLoading } = useGPCNodes({
    queryScope: gpcScope,
    gpcSegmentCode,
    gpcFamilyCode,
    gpcClassCode,
    gpcBrickCode,
    gpcAttributeCode,
    gpcValueCode,
    queryValue: debouncedQuery,
    limit: 50,
  });

  const getGpcCode = (option: GPCNode): string => option.code || '';
  const getGpcDescription = (option: GPCNode): string =>
    option.description || '';

  const getOptionLabel = (option: GPCNode): string => {
    if (option.code === MORE_RESULTS_OPTION.code) {
      return getGpcDescription(option);
    }
    return `${getGpcCode(option)} - ${getGpcDescription(option)}`;
  };

  const findNodeByCode = (code: string): GPCNode | null =>
    nodes.find((node) => getGpcCode(node) === code) || {
      code,
      description: code,
    };

  const normalizeValue = (val: string | GPCNode): GPCNode | null => {
    if (typeof val === 'string') {
      return findNodeByCode(val);
    }
    return val;
  };

  const selectedValue = useMemo(() => {
    if (!value) {
      return null;
    }
    if (typeof value === 'object') {
      if (value.code && value.code.length > 0) {
        return value;
      } else {
        return null;
      }
    } else if (typeof value === 'string') {
      if (value.length === 0) {
        return null;
      } else {
        return normalizeValue(value);
      }
    } else {
      return null;
    }
  }, [value, nodes]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: GPCNode | GPCNode[] | null,
  ) => {
    if (!onChange) return;

    const node = newValue as GPCNode | null;
    if (node && node.code === MORE_RESULTS_OPTION.code) {
      return;
    }
    onChange(node);
  };

  // Combine API nodes with filtering if props provided
  const allNodes = nodes;
  const options = filterOptions ? filterOptions(allNodes) : allNodes;

  return (
    <Autocomplete
      multiple={false}
      value={selectedValue}
      onChange={handleChange}
      inputValue={inputValue}
      fullWidth={true}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        // Since we limit to 50 on server, if we get 50, valid assumption there are more
        // But the API might return fewer if there are no matches.
        // We can just add MORE_RESULTS if we have many results or if we know there are more.
        // For now, if we have 50, we add "Type to see more" to encourage typing?
        // Actually, if we hit the limit, we should show "MORE".
        // But here we rely on the `nodes` length.
        if (nodes.length >= 50 && filtered.length >= 50) {
          return [...filtered, MORE_RESULTS_OPTION];
        }
        return filtered;
      }}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, value) => {
        if (option.code === MORE_RESULTS_OPTION.code) return false;
        return getGpcCode(option) === getGpcCode(value);
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
          label={label ?? t('gpc.selector.label', 'GPC Classification')}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          slotProps={{
            inputLabel: { shrink: true },
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
                {t('gpc.selector.moreResults', 'Type to see more results...')}
              </Typography>
            </Box>
          );
        }
        return (
          <Box
            component="li"
            key={key}
            {...optionProps}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {option.code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.description}
            </Typography>
          </Box>
        );
      }}
      noOptionsText={
        isLoading
          ? t('common.loading', 'Loading...')
          : t('gpc.selector.noOptions', 'No options')
      }
    />
  );
};

export default GPCSelector;
