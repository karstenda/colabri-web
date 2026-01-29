import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import type { User } from '../../../api/ColabriAPI';
import { useGroups } from '../../hooks/useGroups/useGroups';
import {
  useIsOrgAdmin,
  useOrganization,
} from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { AssigneeSelector } from '../../components/AssigneeSelector';
import { Assignee } from '../../data/Common';

export type UserFormEntries = Partial<
  Omit<User, 'id' | 'updatedAt' | 'createdBy' | 'updatedBy'> & {
    groupIds: string[];
  }
>;

export interface UserFormState {
  values: UserFormEntries;
  errors: Partial<Record<keyof UserFormState['values'], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface UserFormProps {
  formMode: 'create' | 'edit';
  formState: UserFormState;
  onFieldChange: (
    name: keyof UserFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (formValues: Partial<UserFormState['values']>) => Promise<void>;
  onReset?: (formValues: Partial<UserFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function UserForm(props: UserFormProps) {
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

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const organization = useOrganization();
  const isOrgAdmin = useIsOrgAdmin();
  const { groups } = useGroups(organization?.id || '', { limit: 100 });

  // Get special groups
  const usersGroup = React.useMemo(
    () => groups.find((g) => g.name === 'Users'),
    [groups],
  );
  const adminGroup = React.useMemo(
    () => groups.find((g) => g.name === 'Administrators'),
    [groups],
  );

  // Filter groups based on business rules
  const availableGroups = React.useMemo(() => {
    return groups.filter((group) => {
      // Hide admin group from non-admins
      const isAdminGroup = group.name === 'Administrators';
      return !isAdminGroup || (isAdminGroup && isOrgAdmin);
    });
  }, [groups, isOrgAdmin]);

  // Helper function to convert group IDs to Assignee objects
  const getSelectedGroupAssignees = React.useMemo((): Assignee[] => {
    if (!formValues.groupIds) return [];
    return formValues.groupIds
      .map((groupId) => {
        // First try to find in available groups
        let group = availableGroups.find((g) => g.id === groupId);

        // If not found in available groups, try to find in all groups
        // This handles cases where non-admin users are viewing admin group members
        if (!group) {
          group = groups.find((g) => g.id === groupId);
        }

        return group ? { ...group, type: 'group' as const } : null;
      })
      .filter(
        (assignee): assignee is typeof assignee & { type: 'group' } =>
          assignee !== null,
      ) as Assignee[];
  }, [formValues.groupIds, availableGroups, groups]);

  // Helper function to handle group selection changes
  const handleGroupAssigneeChange = React.useCallback(
    (assignees: Assignee | Assignee[] | null) => {
      if (!assignees) {
        assignees = [];
      }

      const assigneeArray = Array.isArray(assignees) ? assignees : [assignees];
      let groupIds = assigneeArray
        .filter((assignee) => assignee.type === 'group')
        .map((assignee) => assignee.id);

      // Business rule: Always ensure Users group is included (if it exists)
      const usersGroupId = usersGroup?.id;
      if (usersGroupId && !groupIds.includes(usersGroupId)) {
        groupIds = [usersGroupId, ...groupIds];
      }

      // Business rule: If user was previously in admin group and current user is not an admin,
      // they cannot remove themselves or others from admin group
      const adminGroupId = adminGroup?.id;
      const wasInAdminGroup = formValues.groupIds?.includes(adminGroupId || '');
      if (
        adminGroupId &&
        wasInAdminGroup &&
        !isOrgAdmin &&
        !groupIds.includes(adminGroupId)
      ) {
        groupIds = [...groupIds, adminGroupId];
      }

      onFieldChange('groupIds', groupIds);
    },
    [
      onFieldChange,
      usersGroup?.id,
      adminGroup?.id,
      formValues.groupIds,
      isOrgAdmin,
    ],
  );

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
        event.target.name as keyof UserFormState['values'],
        event.target.value,
      );
    },
    [onFieldChange],
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onFieldChange(
        event.target.name as keyof UserFormState['values'],
        checked,
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
    navigate(backButtonPath ?? '/employees');
  }, [navigate, backButtonPath]);

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
              value={formValues.email ?? ''}
              disabled={isSubmitting || formMode === 'edit'}
              onChange={handleTextFieldChange}
              name="email"
              label="Email"
              error={!!formErrors.email}
              helperText={formErrors.email ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.firstName ?? ''}
              disabled={isSubmitting || formMode === 'edit'}
              onChange={handleTextFieldChange}
              name="firstName"
              label="First Name"
              error={!!formErrors.firstName}
              helperText={formErrors.firstName ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.lastName ?? ''}
              disabled={isSubmitting || formMode === 'edit'}
              onChange={handleTextFieldChange}
              name="lastName"
              label="Last Name"
              error={!!formErrors.lastName}
              helperText={formErrors.lastName ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <AssigneeSelector
              orgId={organization?.id || ''}
              groupsOnly
              multiple
              value={getSelectedGroupAssignees}
              onChange={handleGroupAssigneeChange}
              disabled={isSubmitting}
              error={!!formErrors.groupIds}
              helperText={
                formErrors.groupIds ||
                (usersGroup
                  ? `All users are automatically members of "${usersGroup.name}" group`
                  : ' ')
              }
              label="Groups"
              placeholder="Select groups..."
              customGroups={availableGroups}
            />
          </Grid>
          {formMode === 'edit' && (
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              <FormControl>
                <FormControlLabel
                  name="disabled"
                  control={
                    <Checkbox
                      disabled={isSubmitting}
                      size="large"
                      checked={formValues.disabled ?? false}
                      onChange={handleCheckboxFieldChange}
                    />
                  }
                  label="Disabled"
                />
                <FormHelperText error={!!formErrors.disabled}>
                  {formErrors.disabled ?? ' '}
                </FormHelperText>
              </FormControl>
            </Grid>
          )}
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
