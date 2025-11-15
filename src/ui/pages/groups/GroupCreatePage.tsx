import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateGroup } from './GroupFormValidate';
import { useCreateGroup } from '../../hooks/useGroups/useGroups';
import GroupForm, {
  type FormFieldValue,
  type GroupFormState,
} from './GroupForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export default function GroupCreate() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { createGroup } = useCreateGroup(organization?.id || '');

  const [formState, setFormState] = React.useState<GroupFormState>(() => ({
    values: {},
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<GroupFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<GroupFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof GroupFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<GroupFormState['values']>) => {
        const { issues } = validateGroup(values);
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
    setFormValues({});
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateGroup(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      await createGroup({
        name: formValues.name as string,
        description: formValues.description,
      });

      notifications.show('Group created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/' + organization?.id + '/groups');
    } catch (createError) {
      notifications.show(
        `Failed to create group. Reason: ${(createError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors, createGroup, organization?.id]);

  return (
    <PageContainer
      title="New Group"
      breadcrumbs={[
        { title: 'Groups', path: '/org/' + organization?.id + '/groups' },
        { title: 'New' },
      ]}
    >
      <GroupForm
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