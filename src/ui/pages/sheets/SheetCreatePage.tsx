import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateSheet } from './SheetFormValidate';
import { useCreateSheet } from '../../hooks/useSheets/useSheets';
import SheetForm, {
  type FormFieldValue,
  type SheetFormState,
} from './SheetForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { ColabModelType, ColabSheetModel } from '../../../api/ColabriAPI';

export default function SheetCreatePage() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { createSheet } = useCreateSheet(organization?.id || '');

  const [formState, setFormState] = React.useState<SheetFormState>(() => ({
    values: {},
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<SheetFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<SheetFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof SheetFormState['values'], value: FormFieldValue) => {
      const validateField = async (
        values: Partial<SheetFormState['values']>,
      ) => {
        const { issues } = validateSheet(values);
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
    const { issues } = validateSheet(formValues);
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
      // Create the sheet structure based on the form values
      const newSheet = {
        properties: {
          type: ColabModelType.ColabModelSheetType,
          contentType: 'PRODUCT',
          countryCodes:
            formValues.countries?.map((country) => country.code) || [],
          langCodes: formValues.languages?.map((lang) => lang.code) || [],
        },
        content: [
          {
            type: 'text',
            acls: {},
            textElement: {
              nodeName: 'doc',
              children: [
                {
                  nodeName: 'paragraph',
                  children: ['This is set during creation.'],
                  attributes: {},
                },
              ],
              attributes: {},
            },
          },
        ],
        acls: {},
        approvals: {},
      };

      await createSheet({
        name: formValues.name as string,
        sheet: newSheet,
      });

      notifications.show('Sheet created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/' + organization?.id + '/sheets');
    } catch (createError) {
      notifications.show(
        `Failed to create sheet. Reason: ${(createError as Error).message}`,
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
    createSheet,
    organization?.id,
  ]);

  return (
    <PageContainer
      title="New Sheet"
      breadcrumbs={[
        {
          title: 'Sheets',
          path: '/org/' + organization?.id + '/sheets',
        },
        { title: 'New' },
      ]}
    >
      <SheetForm
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
