import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateGroup } from './GroupFormValidate';
import { useGroup, useUpdateGroup } from '../../hooks/useGroups/useGroups';
import GroupForm, {
  type FormFieldValue,
  type GroupFormState,
} from './GroupForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { Group } from '../../../api/ColabriAPI';

type GroupEditFormProps = {
  initialValues: Partial<GroupFormState['values']>;
  onSubmit: (formValues: Partial<GroupFormState['values']>) => Promise<void>;
  group: Group;
};

function GroupEditForm({ initialValues, onSubmit, group }: GroupEditFormProps) {
  const navigate = useNavigate();

  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  const [formState, setFormState] = React.useState<GroupFormState>(() => ({
    values: initialValues,
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
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

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
      await onSubmit(formValues);
      notifications.show('Group updated successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate(`/org/${organization?.id}/groups/${group?.id}`);
    } catch (editError) {
      notifications.show(
        `Failed to update group. Reason: ${(editError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, setFormErrors, organization?.id, group?.id]);

  return (
    <GroupForm
      formState={formState}
      formMode="edit"
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Save"
      backButtonPath={`/org/${organization?.id}/groups/${group?.id}`}
    />
  );
}

export default function GroupEdit() {
  const { groupId } = useParams();

  const { organization } = useUserOrganizationContext();

  const { group, isLoading: isGroupLoading, error: groupError } = useGroup(
    organization?.id || '',
    groupId || '',
    organization !== undefined && groupId !== undefined,
  );

  const { updateGroup } = useUpdateGroup(organization?.id || '');

  const initialFormState: Partial<GroupFormState['values']> = React.useMemo(() => {
    return {
      name: group?.name,
      description: group?.description,
    };
  }, [group]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<GroupFormState['values']>) => {
      if (groupId) {
        await updateGroup({
          groupId,
          data: {
            name: formValues.name,
            description: formValues.description,
          },
        });
      }
    },
    [groupId, updateGroup],
  );

  const renderEdit = React.useMemo(() => {
    if (isGroupLoading) {
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
    if (groupError) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{groupError.message}</Alert>
        </Box>
      );
    }

    return group ? (
      <GroupEditForm group={group} initialValues={initialFormState} onSubmit={handleSubmit} />
    ) : null;
  }, [isGroupLoading, groupError, group, initialFormState, handleSubmit]);

  return (
    <PageContainer
      title={`Edit ${group?.name}`}
      breadcrumbs={[
        { title: 'Groups', path: `/org/${organization?.id}/groups` },
        { title: `${group?.name}`, path: `/org/${organization?.id}/groups/${groupId}` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}