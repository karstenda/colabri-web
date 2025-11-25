import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateStatement } from './StatementFormValidate';
import { useCreateStatement } from '../../hooks/useStatements/useStatements';
import StatementForm, {
  type FormFieldValue,
  type StatementFormState,
} from './StatementForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { ColabStatementDoc } from '../../../api/ColabriAPI';

export default function StatementCreate() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { createStatement } = useCreateStatement(organization?.id || '');

  const [formState, setFormState] = React.useState<StatementFormState>(() => ({
    values: {},
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<StatementFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<StatementFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof StatementFormState['values'], value: FormFieldValue) => {
      const validateField = async (
        values: Partial<StatementFormState['values']>,
      ) => {
        const { issues } = validateStatement(values);
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
    const { issues } = validateStatement(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(
          issues.map((issue) => [issue.path?.[0], issue.message]),
        ),
      );
      return;
    }
    setFormErrors({});

    try {
      await createStatement({
        name: formValues.name as string,
        statement: formValues.statement as ColabStatementDoc,
      });

      notifications.show('Statement created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/' + organization?.id + '/statements');
    } catch (createError) {
      notifications.show(
        `Failed to create statement. Reason: ${(createError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [
    formValues,
    navigate,
    notifications,
    setFormErrors,
    createStatement,
    organization?.id,
  ]);

  return (
    <PageContainer
      title="New Statement"
      breadcrumbs={[
        {
          title: 'Statements',
          path: '/org/' + organization?.id + '/statements',
        },
        { title: 'New' },
      ]}
    >
      <StatementForm
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
