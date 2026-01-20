import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { validate as validateProduct } from './ProductFormValidate';
import {
  useProduct,
  useUpdateProduct,
} from '../../hooks/useProducts/useProducts';
import ProductForm, {
  type FormFieldValue,
  type ProductFormState,
  productToFormValues,
  formValuesToUpdateRequest,
} from './ProductForm';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

type ProductEditFormProps = {
  initialValues: Partial<ProductFormState['values']>;
  onSubmit: (formValues: Partial<ProductFormState['values']>) => Promise<void>;
};

function ProductEditForm({ initialValues, onSubmit }: ProductEditFormProps) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const notifications = useNotifications();

  const { organization } = useUserOrganizationContext();

  const [formState, setFormState] = React.useState<ProductFormState>(() => ({
    values: initialValues,
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<ProductFormState['values']>) => {
      setFormState((previousState) => {
        return {
          ...previousState,
          values: {
            ...newFormValues,
          },
        };
      });
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
      setFormState((prevState) => {
        let newFormValues: Partial<ProductFormState['values']>;

        if (
          name === 'attributeValues' &&
          typeof value === 'object' &&
          value !== null &&
          'attributeName' in value
        ) {
          // Handle attribute value change
          newFormValues = {
            ...prevState.values,
            attributeValues: {
              ...prevState.values.attributeValues,
              [value.attributeName]: value.value,
            },
          };
        } else {
          newFormValues = { ...prevState.values, [name]: value };
        }

        // Validate the new values
        const { issues } = validateProduct(newFormValues);
        const newFormErrors = {
          ...prevState.errors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        };

        return {
          values: newFormValues,
          errors: newFormErrors,
        };
      });
    },
    [],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

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
      await onSubmit(formValues);
      notifications.show(t('products.editSuccess'), {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate(`/org/${organization?.id}/config/products/${productId}`);
    } catch (editError) {
      notifications.show(
        t('products.editError', { reason: (editError as Error).message }),
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw editError;
    }
  }, [
    formValues,
    navigate,
    notifications,
    onSubmit,
    setFormErrors,
    organization,
    productId,
    t,
  ]);

  return (
    <ProductForm
      formState={formState}
      formMode="edit"
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel={t('common.save')}
      backButtonPath={`/org/${organization?.id}/config/products/${productId}`}
    />
  );
}

export default function ProductEditPage() {
  const { productId } = useParams();
  const { t } = useTranslation();

  const { organization } = useUserOrganizationContext();

  const { product, isLoading, error } = useProduct(
    organization?.id || '',
    productId || '',
    organization !== undefined && productId !== undefined,
  );

  const { updateProduct } = useUpdateProduct(organization?.id || '');

  const initialFormState: Partial<ProductFormState['values']> =
    React.useMemo(() => {
      return productToFormValues(product);
    }, [product]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<ProductFormState['values']>) => {
      if (productId) {
        await updateProduct({
          productId,
          data: formValuesToUpdateRequest(formValues),
        });
      }
    },
    [productId, updateProduct],
  );

  const pageTitle = t('products.edit', { name: product?.name || '' });

  if (isLoading) {
    return (
      <PageContainer
        title={pageTitle}
        breadcrumbs={[
          {
            title: t('products.title'),
            path: '/org/' + organization?.id + '/config/products',
          },
          {
            title: product?.name || '',
            path: '/org/' + organization?.id + '/config/products/' + productId,
          },
          { title: t('common.edit') },
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
          {
            title: t('products.title'),
            path: '/org/' + organization?.id + '/config/products',
          },
          { title: t('common.edit') },
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
        {
          title: t('products.title'),
          path: '/org/' + organization?.id + '/config/products',
        },
        {
          title: product?.name || '',
          path: '/org/' + organization?.id + '/config/products/' + productId,
        },
        { title: t('common.edit') },
      ]}
    >
      <ProductEditForm
        initialValues={initialFormState}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
