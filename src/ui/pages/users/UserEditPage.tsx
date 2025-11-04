import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateUser } from './UserFormValidate';
import { useUser, useUserGroups, useUpdateUser } from '../../hooks/useUsers/useUsers';
import UserForm, {
  type FormFieldValue,
  type UserFormState,
} from './UserForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';


type UserEditFormProps = {
    initialValues: Partial<UserFormState['values']>;
    onSubmit: (formValues: Partial<UserFormState['values']>) => Promise<void>;
};

function UserEditForm({ initialValues, onSubmit }: UserEditFormProps) {

  const { userId } = useParams();
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();


  const [formState, setFormState] = React.useState<UserFormState>(() => ({
    values: initialValues,
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<UserFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<UserFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof UserFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<UserFormState['values']>) => {
        const { issues } = validateUser(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateUser(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      await onSubmit(formValues);
      notifications.show('User edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate(`/org/${organization?.id}/users/${userId}`);
    } catch (editError) {
      notifications.show(
        `Failed to edit user. Reason: ${(editError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, setFormErrors]);

  return (
    <UserForm
      formState={formState}
      formMode="edit"
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Save"
      backButtonPath={`/org/${organization?.id}/users/${userId}`}
    />
  );
}

export default function UserEdit() {
  const { userId } = useParams();

  const { organization } = useUserOrganizationContext();

  const { user, isLoading: isUserLoading, error: userError } = useUser(organization?.id || '', userId || '', organization !== undefined && userId !== undefined);

  const { userGroups, isLoading: isUserGroupsLoading, error: userGroupsError } = useUserGroups(organization?.id || '', userId || '', organization !== undefined && userId !== undefined);

  const isLoading = isUserLoading || isUserGroupsLoading;

  const { updateUser } = useUpdateUser(organization?.id || '', );

  const initialFormState: Partial<UserFormState['values']> = React.useMemo(() => {
    return {
      ...user,
      groupIds: userGroups ? userGroups.map((group) => group.id) : [],
    };
  }, [user, userGroups]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<UserFormState['values']>) => {
        if (userId) {
            await updateUser({ userId, data: {
                disabled: formValues.disabled,
            }});
        }
    },
    [userId],
  );

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (userError) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{userError.message}</Alert>
        </Box>
      );
    }
    if (userGroupsError) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{userGroupsError.message}</Alert>
        </Box>
      );
    }

    return user ? (
      <UserEditForm initialValues={initialFormState} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, userError, user, handleSubmit]);

  return (
    <PageContainer
      title={`Edit ${user?.email}`}
      breadcrumbs={[
        { title: 'Users', path: `/org/${organization?.id}/users` },
        { title: `${user?.email}`, path: `/org/${organization?.id}/users/${userId}` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
