import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSetupFormData } from '../AutoSetupData';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import OrgProductForm, {
  FormFieldValue,
  ProductFormState,
} from '../../../components/ProductForm/ProductForm';
import { useCreateProduct } from '../../../hooks/useProducts/useProducts';
import { useOrganization } from '../../../context/UserOrganizationContext/UserOrganizationProvider';
import { CreateAttributeValueRequest } from '../../../../api/ColabriAPI';
import { validate } from '../../../components/ProductForm/ProductFormValidate';
import useNotifications from '../../../hooks/useNotifications/useNotifications';

export type AutoSetupProductCategoriesStepProps = {
  setupFormData: AutoSetupFormData;
  setSetupFormData: React.Dispatch<React.SetStateAction<AutoSetupFormData>>;
};

export type AutoSetupProductCategoriesStepRef = {
  onNext: () => Promise<boolean>;
};

const AutoSetupProductCategoriesStep = forwardRef<
  AutoSetupProductCategoriesStepRef,
  AutoSetupProductCategoriesStepProps
>(({ setupFormData, setSetupFormData }, ref) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const { createProduct } = useCreateProduct(organization?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifications = useNotifications();

  const [productFormState, setProductFormState] = useState<ProductFormState>({
    values: {},
    errors: {},
  });

  // When moving to the next step, save the selected languages
  useImperativeHandle(ref, () => ({
    onNext: async () => {
      // Validate the results first
      const { issues } = validate(productFormState.values);

      // Set the issues
      setProductFormState((prev) => {
        const newState = { ...prev, errors: {} as ProductFormState['errors'] };
        for (const issue of issues) {
          newState.errors[issue.path[0] as keyof ProductFormState['errors']] =
            issue.message;
        }
        return newState;
      });

      // If there are issues, do not proceed
      if (issues && issues.length > 0) {
        return false;
      }

      // Proceed to saveing
      return await save();
    },
  }));

  // Create the product
  const save = async () => {
    // Quick validation
    if (!organization || !productFormState.values.name) {
      return false;
    }

    // Prepare attribute values
    const attributeCreateRequests: CreateAttributeValueRequest[] = [];
    const attrs = productFormState.values.attributeValues || {};
    for (const key in attrs) {
      const attrKey = key as keyof typeof attrs;
      const value = attrs[attrKey];
      if (value) {
        attributeCreateRequests.push({
          attributeName: key,
          value: value,
        });
      }
    }

    try {
      // Create the product
      setIsSubmitting(true);
      await createProduct({
        name: productFormState.values.name,
        attributeValues: attributeCreateRequests,
      });
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setIsSubmitting(false);
      notifications.show(
        t('autosetup.stepError', { error: (error as Error).message }),
        {
          severity: 'error',
          autoHideDuration: 5000,
        },
      );
      return false;
    }
  };

  // Handle form field changes
  const handleFormFieldChange = (
    name: keyof ProductFormState['values'],
    value: FormFieldValue,
  ) => {
    // Update the product form state
    setProductFormState((prev) => {
      return {
        ...prev,
        values: {
          ...prev.values,
          [name]:
            name === 'attributeValues' && value instanceof Object
              ? {
                  ...(prev.values.attributeValues || {}),
                  [value.attributeName]: value.value,
                }
              : value,
        },
      };
    });

    // Update the setup form data
    setSetupFormData((prev) => ({
      ...prev,
      product: {
        [name]:
          name === 'attributeValues' && value instanceof Object
            ? {
                ...(prev.product.attributeValues || {}),
                [value.attributeName]: value.value,
              }
            : value,
      },
    }));
  };

  return (
    <Stack spacing={4}>
      <Typography variant="body2" gutterBottom>
        {t('autosetup.steps.products.description')}
      </Typography>

      <OrgProductForm
        formState={productFormState}
        onFieldChange={handleFormFieldChange}
        isSubmitting={isSubmitting}
        placeholders={{
          NAME: t('autosetup.steps.products.placeholders.name'),
          OBH_DIVISION: t('autosetup.steps.products.placeholders.obhDivision'),
          OBH_BRAND: t('autosetup.steps.products.placeholders.obhBrand'),
          OBH_SUBBRAND: t('autosetup.steps.products.placeholders.obhSubbrand'),
          OBH_PRODUCT: t('autosetup.steps.products.placeholders.obhProduct'),
          OBH_VARIANT: t('autosetup.steps.products.placeholders.obhVariant'),
          OBH_SIZE: t('autosetup.steps.products.placeholders.obhSize'),
          GPC_SEGMENT: t('autosetup.steps.products.placeholders.gpcSegment'),
          GPC_FAMILY: t('autosetup.steps.products.placeholders.gpcFamily'),
          GPC_CLASS: t('autosetup.steps.products.placeholders.gpcClass'),
          GPC_BRICK: t('autosetup.steps.products.placeholders.gpcBrick'),
        }}
      />
    </Stack>
  );
});

export default AutoSetupProductCategoriesStep;
