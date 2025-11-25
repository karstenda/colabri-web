import React from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Chip,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { ContentType, DocumentType } from '../../../api/ColabriAPI';
import { useContentTypes } from '../../hooks/useTemplates/useTemplates';

export interface ContentTypeSelectorProps {
  /**
   * Organization ID to fetch content types from
   */
  orgId: string;

  /**
   * Currently selected content type code(s)
   */
  value?: string | string[];

  /**
   * Callback when selection changes
   */
  onChange?: (value: string | string[] | null) => void;

  /**
   * Whether to allow multiple selections
   */
  multiple?: boolean;

  /**
   * Filter content types by document type
   */
  docTypeFilter?: DocumentType;

  /**
   * Placeholder text for the input
   */
  placeholder?: string;

  /**
   * Label for the input field
   */
  label?: string;

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
   * Helper text to display below the input
   */
  helperText?: string;
}

// Helper function to get content type display name
const getContentTypeDisplayName = (contentType: ContentType): string => {
  return contentType.name || contentType.code || 'Unknown Type';
};

// ContentTypeChip component
interface ContentTypeChipProps {
  contentType: ContentType;
  onDelete?: () => void;
}

const ContentTypeChip: React.FC<ContentTypeChipProps> = ({
  contentType,
  onDelete,
}) => {
  const theme = useTheme();

  return (
    <Chip
      label={getContentTypeDisplayName(contentType)}
      onDelete={onDelete}
      sx={{
        '& .MuiChip-label': {
          fontWeight: 'normal',
        },
      }}
      avatar={
        <Avatar
          sx={{
            marginLeft: 0,
            bgcolor: theme.palette.grey[400],
            width: 32,
            height: 32,
            '&.MuiChip-avatarSmall': {
              width: 24,
              height: 24,
              marginLeft: 0,
            },
          }}
        >
          <ArticleIcon fontSize="small" />
        </Avatar>
      }
    />
  );
};

export default function ContentTypeSelector({
  orgId,
  value,
  onChange,
  multiple = false,
  docTypeFilter,
  placeholder = 'Select content type(s)...',
  label = 'Content Type',
  disabled = false,
  required = false,
  error = false,
  helperText,
}: ContentTypeSelectorProps) {
  const theme = useTheme();

  // Fetch content types
  const { data, isLoading } = useContentTypes(orgId, !!orgId);

  // Filter options by docType if specified
  const options = React.useMemo(() => {
    const contentTypes = data?.data || [];
    if (docTypeFilter) {
      return contentTypes.filter((ct) => ct.docType === docTypeFilter);
    }
    return contentTypes;
  }, [data, docTypeFilter]);

  // Convert string codes to ContentType objects for internal use
  const normalizedValue = React.useMemo(() => {
    if (!value) return multiple ? [] : null;

    const codes = multiple
      ? Array.isArray(value)
        ? value
        : [value]
      : Array.isArray(value)
      ? value[0]
      : value;

    if (!codes) return multiple ? [] : null;

    if (multiple) {
      return options.filter((ct) =>
        (codes as string[]).includes(ct.code || ''),
      );
    }
    return options.find((ct) => ct.code === codes) || null;
  }, [value, multiple, options]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: ContentType | ContentType[] | null,
  ) => {
    if (!newValue) {
      onChange?.(null);
      return;
    }

    if (multiple) {
      const codes = (newValue as ContentType[]).map((ct) => ct.code || '');
      onChange?.(codes);
    } else {
      const code = (newValue as ContentType).code || '';
      onChange?.(code);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={normalizedValue}
      onChange={handleChange}
      disabled={disabled || isLoading}
      loading={isLoading}
      getOptionLabel={getContentTypeDisplayName}
      isOptionEqualToValue={(option, value) => option.code === value.code}
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
          placeholder={
            !normalizedValue ||
            (Array.isArray(normalizedValue) && normalizedValue.length === 0)
              ? placeholder
              : ''
          }
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
      renderOption={(props, option) => (
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
            <ArticleIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2">
              {getContentTypeDisplayName(option)}
            </Typography>
            {option.description && (
              <Typography variant="caption" color="text.secondary">
                {option.description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
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
                <ContentTypeChip
                  key={option.code || option.name}
                  contentType={option}
                />
              ))}
            </Box>
          );
        }

        const singleValue = Array.isArray(selected) ? selected[0] : selected;
        return getContentTypeDisplayName(singleValue);
      }}
      noOptionsText={isLoading ? 'Loading...' : 'No content types found'}
    />
  );
}
