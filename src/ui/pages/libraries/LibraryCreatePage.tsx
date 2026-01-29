import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateLibrary } from './LibraryFormValidate';
import { useCreateLibrary } from '../../hooks/useLibraries/useLibraries';
import LibraryForm, {
  type FormFieldValue,
  type LibraryFormState,
} from './LibraryForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export default function LibraryCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { createLibrary } = useCreateLibrary(organization?.id || '');

  const [formState, setFormState] = React.useState<LibraryFormState>(() => ({
    values: {},
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<LibraryFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<LibraryFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof LibraryFormState['values'], value: FormFieldValue) => {
      const validateField = async (
        values: Partial<LibraryFormState['values']>,
      ) => {
        const { issues } = validateLibrary(values);
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
    const { issues } = validateLibrary(formValues);
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
      await createLibrary({
        name: formValues.name as string,
        type: formValues.type as string,
      });

      notifications.show(t('libraries.messages.createSuccess'), {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/' + organization?.id + '/config/libraries');
    } catch (createError) {
      notifications.show(
        t('libraries.messages.createError', {
          message: (createError as Error).message,
        }),
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
    }
  }, [
    createLibrary,
    formValues,
    navigate,
    notifications,
    organization?.id,
    setFormErrors,
    t,
  ]);

  return (
    <PageContainer
      title={t('libraries.createTitle')}
      breadcrumbs={[
        {
          title: t('libraries.title'),
          path: `/org/${organization?.id}/config/libraries`,
        },
        { title: t('libraries.createTitle') },
      ]}
    >
      <LibraryForm
        formMode="create"
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel={t('common.create')}
      />
    </PageContainer>
  );
}
