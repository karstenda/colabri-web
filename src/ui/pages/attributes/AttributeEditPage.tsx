import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateAttribute } from './AttributeFormValidate';
import { useAttribute, useUpdateAttribute } from '../../hooks/useAttributes/useAttributes';
import AttributeForm, {
  type FormFieldValue,
  type AttributeFormState,
} from './AttributeForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

type AttributeEditFormProps = {
    initialValues: Partial<AttributeFormState['values']>;
    onSubmit: (formValues: Partial<AttributeFormState['values']>) => Promise<void>;
};

function AttributeEditForm({ initialValues, onSubmit }: AttributeEditFormProps) {

  const { attributeId } = useParams();
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const [formState, setFormState] = React.useState<AttributeFormState>(() => ({
    values: initialValues,
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<AttributeFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<AttributeFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof AttributeFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<AttributeFormState['values']>) => {
        const { issues } = validateAttribute(values);
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
    const { issues } = validateAttribute(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      await onSubmit(formValues);
      notifications.show('Attribute edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate(`/org/${organization?.id}/attributes/${attributeId}`);
    } catch (editError) {
      notifications.show(
        `Failed to edit attribute. Reason: ${(editError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, setFormErrors, organization, attributeId]);

  return (
    <AttributeForm
      formState={formState}
      formMode="edit"
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Save"
      backButtonPath={`/org/${organization?.id}/attributes/${attributeId}`}
    />
  );
}

export default function AttributeEditPage() {
  const { attributeId } = useParams();

  const { organization } = useUserOrganizationContext();

  const { attribute, isLoading, error } = useAttribute(
    organization?.id || '', 
    attributeId || '', 
    organization !== undefined && attributeId !== undefined
  );

  const { updateAttribute } = useUpdateAttribute(organization?.id || '');

  const initialFormState: Partial<AttributeFormState['values']> = React.useMemo(() => {
    return {
      ...attribute,
    };
  }, [attribute]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<AttributeFormState['values']>) => {
        if (attributeId) {
            await updateAttribute({ 
              attributeId, 
              data: {
                name: formValues.name as string,
                type: formValues.type as any,
                config: formValues.config || {},
              }
            });
        }
    },
    [attributeId, updateAttribute],
  );

  const pageTitle = `Edit ${attribute ? attribute.name : 'Attribute'}`;

  if (isLoading) {
    return (
      <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Attributes', path: '/org/'+organization?.id+'/attributes' },
          { title: attribute?.name || '', path: '/org/'+organization?.id+'/attributes/' + attributeId },
          { title: 'Edit' },
        ]}
      >
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
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Attributes', path: '/org/'+organization?.id+'/attributes' },
          { title: 'Edit' },
        ]}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Attributes', path: '/org/'+organization?.id+'/attributes' },
        { title: attribute?.name || '', path: '/org/'+organization?.id+'/attributes/' + attributeId },
        { title: 'Edit' },
      ]}
    >
      <AttributeEditForm initialValues={initialFormState} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
