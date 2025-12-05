import React from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { User, Group } from '../../../api/ColabriAPI';
import { useUsers } from '../../hooks/useUsers/useUsers';
import { useGroups } from '../../hooks/useGroups/useGroups';
import UserAvatar from '../UserAvatar/UserAvatar';
import { AssigneeChip } from '../AssigneeChip';
import { Assignee, getAssigneeDisplayName } from '../../data/Common';

export interface AssigneeSelectorProps {
  /**
   * Organization ID to fetch users and groups from
   */
  orgId: string;

  /**
   * Currently selected assignees
   */
  value?: Assignee | Assignee[];

  /**
   * Callback when selection changes
   */
  onChange?: (value: Assignee | Assignee[] | null) => void;

  /**
   * Whether to allow multiple selections
   */
  multiple?: boolean;

  /**
   * Whether to show only users (excludes groups)
   */
  usersOnly?: boolean;

  /**
   * Whether to show only groups (excludes users)
   */
  groupsOnly?: boolean;

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

  /**
   * Limit for users query (default: 100)
   */
  userLimit?: number;

  /**
   * Limit for groups query (default: 100)
   */
  groupLimit?: number;

  /**
   * Custom users to use instead of fetching from API
   */
  customUsers?: User[];

  /**
   * Custom groups to use instead of fetching from API
   */
  customGroups?: Group[];
}

// Helper function to create assignee objects
const createUserAssignee = (user: User): Assignee => ({
  ...user,
  type: 'user' as const,
});

const createGroupAssignee = (group: Group): Assignee => ({
  ...group,
  type: 'group' as const,
});

export default function AssigneeSelector({
  orgId,
  value,
  onChange,
  multiple = false,
  usersOnly = false,
  groupsOnly = false,
  placeholder = 'Select assignee(s)...',
  label,
  disabled = false,
  required = false,
  error = false,
  helperText,
  userLimit = 100,
  groupLimit = 100,
  customUsers,
  customGroups,
}: AssigneeSelectorProps) {
  const theme = useTheme();

  // Fetch users and groups (only if custom ones aren't provided)
  const { users: fetchedUsers = [], isLoading: usersLoading } = useUsers(
    orgId,
    { limit: userLimit },
    !groupsOnly && !customUsers,
  );

  const { groups: fetchedGroups = [], isLoading: groupsLoading } = useGroups(
    orgId,
    { limit: groupLimit },
    !usersOnly && !customGroups,
  );

  // Use custom data if provided, otherwise use fetched data
  const users = customUsers || fetchedUsers;
  const groups = customGroups || fetchedGroups;

  // Combine and prepare options
  const options: Assignee[] = React.useMemo(() => {
    const result: Assignee[] = [];

    if (!groupsOnly) {
      result.push(...users.map(createUserAssignee));
    }

    if (!usersOnly) {
      result.push(...groups.map(createGroupAssignee));
    }

    return result;
  }, [users, groups, usersOnly, groupsOnly]);

  const loading =
    (usersLoading && !customUsers) || (groupsLoading && !customGroups);

  // Handle value normalization for single/multiple modes
  const normalizedValue = React.useMemo(() => {
    if (!value) return multiple ? [] : null;
    if (multiple) {
      return Array.isArray(value) ? value : [value];
    }
    return Array.isArray(value) ? value[0] || null : value;
  }, [value, multiple]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: Assignee | Assignee[] | null,
  ) => {
    onChange?.(newValue);
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={normalizedValue}
      onChange={handleChange}
      disabled={disabled || loading}
      loading={loading}
      getOptionLabel={getAssigneeDisplayName}
      isOptionEqualToValue={(option, value) =>
        option.type === value.type && option.id === value.id
      }
      groupBy={
        !usersOnly && !groupsOnly
          ? (option) => (option.type === 'user' ? 'Users' : 'Groups')
          : undefined
      }
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
              : undefined
          }
          required={required}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
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
          {option.type === 'user' ? (
            <UserAvatar user={option} width={32} height={32} />
          ) : (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.grey[400],
              }}
            >
              <GroupIcon fontSize="small" />
            </Avatar>
          )}
          <Box>
            <Typography variant="body2">
              {getAssigneeDisplayName(option)}
            </Typography>
            {option.type === 'user' && option.email && (
              <Typography variant="caption" color="text.secondary">
                {option.email}
              </Typography>
            )}
            {option.type === 'group' && option.description && (
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
                <AssigneeChip
                  key={`${option.type}-${option.id}`}
                  assignee={option}
                />
              ))}
            </Box>
          );
        }

        const singleValue = Array.isArray(selected) ? selected[0] : selected;
        return getAssigneeDisplayName(singleValue);
      }}
      noOptionsText={
        loading
          ? 'Loading...'
          : usersOnly
          ? 'No users found'
          : groupsOnly
          ? 'No groups found'
          : 'No users or groups found'
      }
    />
  );
}
