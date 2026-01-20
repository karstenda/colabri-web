import { useCallback } from 'react';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import Divider from '@mui/material/Divider';
import GPCCategorySelector, {
  GPCCategoryValue,
} from '../../../../components/GPCCategorySelector/GPCCategorySelector';
import { useTheme } from '@mui/material/styles';

export type AutoSetupProductFormEntries = {
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

export interface AutoSetupProductFormState {
  values: AutoSetupProductFormEntries;
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

export type FormFieldValue = string | { attributeName: string; value: string };

type AutoSetupProductFormProps = {
  formState: AutoSetupProductFormState;
  placeholders?: Record<string, string>;
  onFieldChange: (
    name: keyof AutoSetupProductFormState['values'],
    value: FormFieldValue,
  ) => void;
  isSubmitting?: boolean;
};

const AutoSetupProductForm = ({
  formState,
  placeholders,
  onFieldChange,
  isSubmitting,
}: AutoSetupProductFormProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleTextFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const field = event.target.name;
      if (field.startsWith('OBH_')) {
        onFieldChange('attributeValues', {
          attributeName: field,
          value: event.target.value,
        });
        return;
      } else {
        onFieldChange(
          field as keyof AutoSetupProductFormState['values'],
          event.target.value,
        );
      }
    },
    [onFieldChange],
  );

  const handleGpcFieldChange = useCallback(
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
        onFieldChange('attributeValues', {
          attributeName: attributeName,
          value: selectedGpcCategoryValue[f]?.code || '',
        });
      }
    },
    [onFieldChange],
  );

  return (
    <Box>
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
              value={formState.values.name ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="name"
              label={t('common.name')}
              placeholder={placeholders?.NAME}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.name}
              helperText={formState.errors.name ?? ' '}
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
              value={formState.values.attributeValues?.OBH_DIVISION ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_DIVISION"
              label={t('obh.name.division')}
              placeholder={placeholders?.OBH_DIVISION}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.attributeValues?.OBH_DIVISION}
              helperText={formState.errors.attributeValues?.OBH_DIVISION ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formState.values.attributeValues?.OBH_BRAND ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_BRAND"
              label={t('obh.name.brand')}
              placeholder={placeholders?.OBH_BRAND}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.attributeValues?.OBH_BRAND}
              helperText={formState.errors.attributeValues?.OBH_BRAND ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formState.values.attributeValues?.OBH_SUBBRAND ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_SUBBRAND"
              label={t('obh.name.subbrand')}
              placeholder={placeholders?.OBH_SUBBRAND}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.attributeValues?.OBH_SUBBRAND}
              helperText={formState.errors.attributeValues?.OBH_SUBBRAND ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formState.values.attributeValues?.OBH_PRODUCT ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_PRODUCT"
              label={t('obh.name.product')}
              placeholder={placeholders?.OBH_PRODUCT}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.attributeValues?.OBH_PRODUCT}
              helperText={formState.errors.attributeValues?.OBH_PRODUCT ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formState.values.attributeValues?.OBH_VARIANT ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_VARIANT"
              label={t('obh.name.variant')}
              placeholder={placeholders?.OBH_VARIANT}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.attributeValues?.OBH_VARIANT}
              helperText={formState.errors.attributeValues?.OBH_VARIANT ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formState.values.attributeValues?.OBH_SIZE ?? ''}
              disabled={isSubmitting}
              onChange={handleTextFieldChange}
              name="OBH_SIZE"
              label={t('obh.name.size')}
              placeholder={placeholders?.OBH_SIZE}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              error={!!formState.errors.attributeValues?.OBH_SIZE}
              helperText={formState.errors.attributeValues?.OBH_SIZE ?? ' '}
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
                  code: formState.values.attributeValues?.GPC_SEGMENT ?? '',
                },
                gpcFamily: {
                  code: formState.values.attributeValues?.GPC_FAMILY ?? '',
                },
                gpcClass: {
                  code: formState.values.attributeValues?.GPC_CLASS ?? '',
                },
                gpcBrick: {
                  code: formState.values.attributeValues?.GPC_BRICK ?? '',
                },
              }}
              placeholderGPCSegment={t(
                'autosetup.steps.products.placeholders.gpcSegment',
              )}
              placeholderGPCFamily={t(
                'autosetup.steps.products.placeholders.gpcFamily',
              )}
              placeholderGPCClass={t(
                'autosetup.steps.products.placeholders.gpcClass',
              )}
              placeholderGPCBrick={t(
                'autosetup.steps.products.placeholders.gpcBrick',
              )}
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
    </Box>
  );
};

export default AutoSetupProductForm;
