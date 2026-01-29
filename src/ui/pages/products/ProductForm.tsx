import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import type { AttributeValueStruct, OrgProduct } from '../../../api/ColabriAPI';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import GPCCategorySelector, {
  GPCCategoryValue,
} from '../../components/GPCCategorySelector/GPCCategorySelector';

export type ProductFormEntries = {
  name?: string;
  attributeValues?: {
    GPC_SEGMENT?: AttributeValueStruct;
    GPC_FAMILY?: AttributeValueStruct;
    GPC_CLASS?: AttributeValueStruct;
    GPC_BRICK?: AttributeValueStruct;
    OBH_DIVISION?: AttributeValueStruct;
    OBH_BRAND?: AttributeValueStruct;
    OBH_SUBBRAND?: AttributeValueStruct;
    OBH_PRODUCT?: AttributeValueStruct;
    OBH_VARIANT?: AttributeValueStruct;
    OBH_SIZE?: AttributeValueStruct;
  };
};

export interface ProductFormState {
  values: ProductFormEntries;
  errors: {
    name?: string;
    attributeValues?: {
      GPC_SEGMENT?: string;
      GPC_FAMILY?: string;
      GPC_CLASS?: string;
      GPC_BRICK?: string;
      OBH_DIVISION?: string;
      OBH_BRAND?: string;
      OBH_SUBBRAND?: string;
      OBH_PRODUCT?: string;
      OBH_VARIANT?: string;
      OBH_SIZE?: string;
    };
  };
}

export type FormFieldValue =
  | string
  | { attributeName: string; value: AttributeValueStruct };

export interface ProductFormProps {
  formMode: 'create' | 'edit';
  formState: ProductFormState;
  onFieldChange: (
    name: keyof ProductFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (formValues: Partial<ProductFormState['values']>) => Promise<void>;
  onReset?: (formValues: Partial<ProductFormState['values']>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function ProductForm(props: ProductFormProps) {
  const {
    formMode,
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const organization = useOrganization();

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit],
  );

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const field = event.target.name;
      if (field.startsWith('OBH_')) {
        onFieldChange('attributeValues', {
          attributeName: field,
          value: {
            display: event.target.value,
            value: event.target.value as any,
          },
        });
      } else {
        onFieldChange(
          field as keyof ProductFormState['values'],
          event.target.value,
        );
      }
    },
    [onFieldChange],
  );

  const handleGpcFieldChange = React.useCallback(
    (
      selectedGpcCategoryValue: GPCCategoryValue,
      field: (keyof GPCCategoryValue)[],
    ) => {
      for (const f of field) {
        let attributeName = '';
        switch (f) {
          case 'gpcSegment':
            attributeName = 'GPC_SEGMENT';
            break;
          case 'gpcFamily':
            attributeName = 'GPC_FAMILY';
            break;
          case 'gpcClass':
            attributeName = 'GPC_CLASS';
            break;
          case 'gpcBrick':
            attributeName = 'GPC_BRICK';
            break;
          default:
            attributeName = '';
        }

        // Prepare display value
        let display = '';
        if (selectedGpcCategoryValue[f]) {
          display =
            selectedGpcCategoryValue[f]?.code +
            ' - ' +
            selectedGpcCategoryValue[f].description;
        }

        onFieldChange('attributeValues', {
          attributeName: attributeName,
          value: {
            display: display,
            value: {
              code: selectedGpcCategoryValue[f]?.code || '',
            },
          },
        });
      }
    },
    [onFieldChange],
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? `/org/${organization?.id}/products`);
  }, [navigate, backButtonPath, organization]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ marginTop: '16px', marginBottom: '16px', width: '100%' }}
    >
      <FormGroup>
        <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
          <Divider
            orientation="horizontal"
            flexItem
            sx={{
              width: '100%',
              color: (theme.vars || theme).palette.grey[500],
              marginBottom: '20px',
            }}
          >
            {t('products.form.details')}
          </Divider>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.name ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="name"
              label={t('common.name')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.name}
              helperText={formErrors.name ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                width: '100%',
                color: (theme.vars || theme).palette.grey[500],
                marginBottom: '20px',
              }}
            >
              {t('product.form.obhSectionTitle')}
            </Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.attributeValues?.OBH_DIVISION?.display ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_DIVISION"
              label={t('obh.name.division')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.attributeValues?.OBH_DIVISION}
              helperText={formErrors.attributeValues?.OBH_DIVISION ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.attributeValues?.OBH_BRAND?.display ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_BRAND"
              label={t('obh.name.brand')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.attributeValues?.OBH_BRAND}
              helperText={formErrors.attributeValues?.OBH_BRAND ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.attributeValues?.OBH_SUBBRAND?.display ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_SUBBRAND"
              label={t('obh.name.subbrand')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.attributeValues?.OBH_SUBBRAND}
              helperText={formErrors.attributeValues?.OBH_SUBBRAND ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.attributeValues?.OBH_PRODUCT?.display ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_PRODUCT"
              label={t('obh.name.product')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.attributeValues?.OBH_PRODUCT}
              helperText={formErrors.attributeValues?.OBH_PRODUCT ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.attributeValues?.OBH_VARIANT?.display ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_VARIANT"
              label={t('obh.name.variant')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.attributeValues?.OBH_VARIANT}
              helperText={formErrors.attributeValues?.OBH_VARIANT ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.attributeValues?.OBH_SIZE?.display ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_SIZE"
              label={t('obh.name.size')}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formErrors.attributeValues?.OBH_SIZE}
              helperText={formErrors.attributeValues?.OBH_SIZE ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                width: '100%',
                color: (theme.vars || theme).palette.grey[500],
                marginBottom: '20px',
              }}
            >
              {t('product.form.gpcSectionTitle')}
            </Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <GPCCategorySelector
              gpcCategoryValue={{
                gpcSegment: {
                  description: formValues.attributeValues?.GPC_SEGMENT?.display,
                  code:
                    formValues.attributeValues?.GPC_SEGMENT?.value?.code ?? '',
                },
                gpcFamily: {
                  description: formValues.attributeValues?.GPC_FAMILY?.display,
                  code:
                    formValues.attributeValues?.GPC_FAMILY?.value?.code ?? '',
                },
                gpcClass: {
                  description: formValues.attributeValues?.GPC_CLASS?.display,
                  code:
                    formValues.attributeValues?.GPC_CLASS?.value?.code ?? '',
                },
                gpcBrick: {
                  description: formValues.attributeValues?.GPC_BRICK?.display,
                  code:
                    formValues.attributeValues?.GPC_BRICK?.value?.code ?? '',
                },
              }}
              placeholderGPCSegment={t('product.form.placeholders.gpcSegment')}
              placeholderGPCFamily={t('product.form.placeholders.gpcFamily')}
              placeholderGPCClass={t('product.form.placeholders.gpcClass')}
              placeholderGPCBrick={t('product.form.placeholders.gpcBrick')}
              showGPCSegment={true}
              showGPCFamily={true}
              showGPCClass={true}
              showGPCBrick={true}
              disabled={isSubmitting}
              onChange={handleGpcFieldChange}
            />
          </Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          {t('common.back')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}

/**
 * Convert OrgProduct to ProductFormState values
 */
export function productToFormValues(
  product: OrgProduct | null,
): ProductFormEntries {
  if (!product) {
    return { attributeValues: {} };
  }

  const attributeValues: ProductFormEntries['attributeValues'] = {};

  if (product.attributeValues) {
    for (const [key, attrValue] of Object.entries(product.attributeValues)) {
      const attributeName = attrValue.attribute?.name;
      const attributeValueStruct = attrValue.value as AttributeValueStruct;
      if (attributeName) {
        switch (attributeName) {
          case 'GPC_SEGMENT':
            attributeValues.GPC_SEGMENT = attributeValueStruct;
            break;
          case 'GPC_FAMILY':
            attributeValues.GPC_FAMILY = attributeValueStruct;
            break;
          case 'GPC_CLASS':
            attributeValues.GPC_CLASS = attributeValueStruct;
            break;
          case 'GPC_BRICK':
            attributeValues.GPC_BRICK = attributeValueStruct;
            break;
          case 'OBH_DIVISION':
            attributeValues.OBH_DIVISION = attributeValueStruct;
            break;
          case 'OBH_BRAND':
            attributeValues.OBH_BRAND = attributeValueStruct;
            break;
          case 'OBH_SUBBRAND':
            attributeValues.OBH_SUBBRAND = attributeValueStruct;
            break;
          case 'OBH_PRODUCT':
            attributeValues.OBH_PRODUCT = attributeValueStruct;
            break;
          case 'OBH_VARIANT':
            attributeValues.OBH_VARIANT = attributeValueStruct;
            break;
          case 'OBH_SIZE':
            attributeValues.OBH_SIZE = attributeValueStruct;
            break;
        }
      }
    }
  }

  return {
    name: product.name,
    attributeValues,
  };
}

/**
 * Convert ProductFormState values to API request format
 */
export function formValuesToCreateRequest(formValues: ProductFormEntries) {
  const attributeValues = [];

  if (formValues.attributeValues) {
    for (const [key, value] of Object.entries(formValues.attributeValues)) {
      if (value) {
        attributeValues.push({
          attributeName: key,
          value: value,
        });
      }
    }
  }

  return {
    name: formValues.name as string,
    attributeValues,
  };
}

export function formValuesToUpdateRequest(formValues: ProductFormEntries) {
  const attributeValues = [];

  if (formValues.attributeValues) {
    for (const [key, value] of Object.entries(formValues.attributeValues)) {
      if (value !== undefined) {
        attributeValues.push({
          attributeName: key,
          value: value,
        });
      }
    }
  }

  return {
    name: formValues.name,
    attributeValues,
  };
}
