import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateLibrary } from './LibraryFormValidate';
import {
  useLibrary,
  useUpdateLibrary,
} from '../../hooks/useLibraries/useLibraries';
import LibraryForm, {
  type FormFieldValue,
  type LibraryFormState,
} from './LibraryForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { Library } from '../../../api/ColabriAPI';

type LibraryEditFormProps = {
  initialValues: Partial<LibraryFormState['values']>;
  onSubmit: (formValues: Partial<LibraryFormState['values']>) => Promise<void>;
  library: Library;
};

function LibraryEditForm({
  initialValues,
  onSubmit,
  library,
}: LibraryEditFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  const [formState, setFormState] = React.useState<LibraryFormState>(() => ({
    values: initialValues,
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
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

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
      await onSubmit(formValues);
      notifications.show(t('libraries.messages.updateSuccess'), {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate(`/org/${organization?.id}/config/libraries/${library?.id}`);
    } catch (editError) {
      notifications.show(
        t('libraries.messages.updateError', {
          message: (editError as Error).message,
        }),
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
    }
  }, [
    formValues,
    initialValues,
    library?.id,
    navigate,
    notifications,
    onSubmit,
    organization?.id,
    setFormErrors,
    t,
  ]);

  return (
    <LibraryForm
      formMode="edit"
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel={t('common.save')}
      backButtonPath={`/org/${organization?.id}/config/libraries/${library?.id}`}
    />
  );
}

export default function LibraryEditPage() {
  const { libraryId } = useParams();
  const { t } = useTranslation();
  const { organization } = useUserOrganizationContext();

  const { library, isLoading, error } = useLibrary(
    organization?.id || '',
    libraryId || '',
    organization !== undefined && libraryId !== undefined,
  );

  const { updateLibrary } = useUpdateLibrary(organization?.id || '');

  const handleUpdateLibrary = React.useCallback(
    async (data: Partial<Library>) => {
      if (!libraryId) {
        return;
      }

      await updateLibrary({
        libraryId,
        data: {
          name: data.name,
          acls: data.acls,
        },
      });
    },
    [libraryId, updateLibrary],
  );

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error || !library) {
      return (
        <Box sx={{ flex: 1, p: 2 }}>
          <Alert severity="error">
            {t('libraries.messages.loadDetailError', {
              message: error ? error.message : t('libraries.notFound'),
            })}
          </Alert>
        </Box>
      );
    }

    return (
      <LibraryEditForm
        library={library}
        initialValues={{
          name: library.name,
          type: library.type,
          acls: library.acls,
        }}
        onSubmit={handleUpdateLibrary}
      />
    );
  }, [isLoading, error, library, handleUpdateLibrary, t]);

  return (
    <PageContainer
      title={t('libraries.editTitle')}
      breadcrumbs={[
        {
          title: t('libraries.title'),
          path: `/org/${organization?.id}/config/libraries`,
        },
        {
          title: library?.name || '...',
          path: `/org/${organization?.id}/config/libraries/${libraryId}`,
        },
        { title: t('common.edit') },
      ]}
    >
      {renderEdit}
    </PageContainer>
  );
}
