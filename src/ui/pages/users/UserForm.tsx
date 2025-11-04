import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import type { User } from '../../../api/ColabriAPI';
import { useGroups } from '../../hooks/useGroups/useGroups';
import { useIsOrgAdmin, useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';

export type UserFormEntries = Partial<Omit<User, 'id' | 'updatedAt' | 'createdBy' | 'updatedBy'> & { groupIds: string[] }>;

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
      onFieldChange(event.target.name as keyof UserFormState['values'], checked);
    },
    [onFieldChange],
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof UserFormState['values'],
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
    navigate(backButtonPath ?? '/employees');
  }, [navigate, backButtonPath]);

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
            <FormControl error={!!formErrors.groupIds} fullWidth>
              <InputLabel id="user-groups-label">Groups</InputLabel>
              <Select
                value={formValues.groupIds || []}
                disabled={isSubmitting}
                onChange={handleSelectFieldChange as SelectProps['onChange']}
                multiple
                renderValue={(selected) => {
                  const names = selected.map((groupId) => groups.find((g) => g.id === groupId)?.name || groupId);
                  return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {names.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                }}
                labelId="user-groups-label"
                name="groupIds"
                label="Groups"
                fullWidth
              >
                {groups.map((group) => {

                  // Analyze group selection rules
                  const isAllUsers = group.name === 'Users';
                  const isSelectedGroup = formValues.groupIds?.includes(group.id);
                  const isSelected = isAllUsers || isSelectedGroup;
                  const isAdminOnly = group.name === 'Administrators';
                  const isDisabled = isAllUsers || (isAdminOnly && !isOrgAdmin);
                  const show = !isAdminOnly || (isAdminOnly && isOrgAdmin);

                  if (!show) {
                    return <></>
                  } else {
                    return (<MenuItem key={group.id} value={group.id} disabled={isDisabled}>
                      <Checkbox checked={isSelected} />
                        <ListItemText primary={group.name} />
                    </MenuItem>)
                  }
                })}
              </Select>
              <FormHelperText>{formErrors.groupIds ?? ' '}</FormHelperText>
            </FormControl>
          </Grid>
          {formMode === "edit" && <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
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
          </Grid>}
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
