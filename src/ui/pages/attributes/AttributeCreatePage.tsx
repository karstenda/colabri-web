import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateAttribute } from './AttributeFormValidate';
import { useCreateAttribute } from '../../hooks/useAttributes/useAttributes';
import AttributeForm, {
  type FormFieldValue,
  type AttributeFormState,
} from './AttributeForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export default function AttributeCreatePage() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { createAttribute } = useCreateAttribute(organization?.id || '');

  const [formState, setFormState] = React.useState<AttributeFormState>(() => ({
    values: { config: {} },
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
    setFormValues({ config: {} });
  }, [setFormValues]);

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
      await createAttribute({
        name: formValues.name as string,
        type: formValues.type as any,
        config: formValues.config || {},
      });

      notifications.show('Attribute created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/'+organization?.id+'/attributes');
    } catch (createError) {
      notifications.show(
        `Failed to create attribute. Reason: ${(createError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors, createAttribute, organization]);

  return (
    <PageContainer
      title="New Attribute"
      breadcrumbs={[{ title: 'Attributes', path: '/org/'+organization?.id+'/attributes' }, { title: 'New' }]}
    >
      <AttributeForm
        formState={formState}
        formMode="create"
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
        backButtonPath={'/org/'+organization?.id+'/attributes'}
      />
    </PageContainer>
  );
}
