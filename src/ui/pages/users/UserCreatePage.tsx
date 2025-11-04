import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateUser } from './UserFormValidate';
import { useCreateUser } from '../../hooks/useUsers/useUsers';
import UserForm, {
  type FormFieldValue,
  type UserFormState,
} from './UserForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useGroups } from '../../hooks/useGroups/useGroups';



export default function UserCreate() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { groups, isLoading: isLoadingGroups } = useGroups(organization?.id || '', { limit: 100 }, organization !== undefined);

  const { createUser } = useCreateUser(organization?.id || '');

  // Figure out the initial group IDs to assign to the new user
  const initialGroupIds = React.useMemo(
    () => {
      if (isLoadingGroups) {
        return [];
      } else {
        const initialGroupIds = [];
        // Iterate through groups to find "Internal Users" group
        for (const group of groups) {
          if (group.name === 'Internal Users') {
            initialGroupIds.push(group.id);
          }
          if (group.name === 'Users') {
            initialGroupIds.push(group.id);
          }
        }
        return initialGroupIds;
      }
    },
    [groups, isLoadingGroups]
  );

  const [formState, setFormState] = React.useState<UserFormState>(() => ({
    values: { groupIds: [] },
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  // Initialize groupIds only once when initialGroupIds becomes available
  const hasInitializedGroupIds = React.useRef(false);
  if (!hasInitializedGroupIds.current && initialGroupIds.length > 0) {
    hasInitializedGroupIds.current = true;
    formState.values.groupIds = initialGroupIds;
  }

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
    setFormValues({ groupIds: initialGroupIds });
  }, [setFormValues, initialGroupIds]);

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

      await createUser({
        email: formValues.email as string,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        groupIds: formValues.groupIds as string[],
      })

      notifications.show('User created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/'+organization?.id+'/users');
    } catch (createError) {
      notifications.show(
        `Failed to create user. Reason: ${(createError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="New User"
      breadcrumbs={[{ title: 'Users', path: '/org/'+organization?.id+'/users' }, { title: 'New' }]}
    >
      <UserForm
        formState={formState}
        formMode="create"
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
      />
    </PageContainer>
  );
}
