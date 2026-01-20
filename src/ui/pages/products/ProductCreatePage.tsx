import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateProduct } from './ProductFormValidate';
import { useCreateProduct } from '../../hooks/useProducts/useProducts';
import ProductForm, {
  type FormFieldValue,
  type ProductFormState,
  formValuesToCreateRequest,
} from './ProductForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const { createProduct } = useCreateProduct(organization?.id || '');

  const [formState, setFormState] = React.useState<ProductFormState>(() => ({
    values: { attributeValues: {} },
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<ProductFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<ProductFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof ProductFormState['values'], value: FormFieldValue) => {
      let newFormValues: Partial<ProductFormState['values']>;

      if (
        name === 'attributeValues' &&
        typeof value === 'object' &&
        value !== null &&
        'attributeName' in value
      ) {
        // Handle attribute value change
        newFormValues = {
          ...formValues,
          attributeValues: {
            ...formValues.attributeValues,
            [value.attributeName]: value.value,
          },
        };
      } else {
        newFormValues = { ...formValues, [name]: value };
      }

      const validateField = async (
        values: Partial<ProductFormState['values']>,
      ) => {
        const { issues } = validateProduct(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues({ attributeValues: {} });
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateProduct(formValues);
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
      await createProduct(formValuesToCreateRequest(formValues));

      notifications.show(t('products.createSuccess'), {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/org/' + organization?.id + '/config/products');
    } catch (createError) {
      notifications.show(
        t('products.createError', { reason: (createError as Error).message }),
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
    createProduct,
    organization,
    t,
  ]);

  return (
    <PageContainer
      title={t('products.new')}
      breadcrumbs={[
        {
          title: t('products.title'),
          path: '/org/' + organization?.id + '/config/products',
        },
        { title: t('common.new') },
      ]}
    >
      <ProductForm
        formState={formState}
        formMode="create"
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel={t('common.create')}
        backButtonPath={'/org/' + organization?.id + '/products'}
      />
    </PageContainer>
  );
}
