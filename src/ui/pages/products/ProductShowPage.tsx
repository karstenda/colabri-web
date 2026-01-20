import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  useDeleteProduct,
  useProduct,
} from '../../hooks/useProducts/useProducts';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useTheme } from '@mui/material/styles';

export default function ProductShowPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const organization = useOrganization();

  const { product, isLoading, error } = useProduct(
    organization?.id || '',
    productId || '',
    organization !== undefined && productId !== undefined,
  );

  const { deleteProduct } = useDeleteProduct(organization?.id || '');

  const handleProductEdit = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/products/${productId}/edit`);
  }, [navigate, productId, organization]);

  const handleProductDelete = React.useCallback(async () => {
    if (!product) {
      return;
    }

    const confirmed = await dialogs.confirm(
      t('products.deleteConfirmMessage', { name: product.name }),
      {
        title: t('products.deleteConfirmTitle'),
        severity: 'error',
        okText: t('common.delete'),
        cancelText: t('common.cancel'),
      },
    );

    if (confirmed) {
      try {
        await deleteProduct(productId as string);

        navigate(`/org/${organization?.id}/config/products/`);

        notifications.show(t('products.deleteSuccess'), {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          t('products.deleteError', { reason: (deleteError as Error).message }),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [
    product,
    dialogs,
    productId,
    navigate,
    notifications,
    deleteProduct,
    organization,
    t,
  ]);

  const handleBack = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/products`);
  }, [navigate, organization]);

  // Extract attribute values for display
  const getAttributeValue = React.useCallback(
    (attributeName: string): string => {
      if (!product?.attributeValues) return '-';
      const attrValue = Object.values(product.attributeValues).find(
        (av) => av.attribute?.name === attributeName,
      );
      return attrValue?.value ? String(attrValue.value) : '-';
    },
    [product],
  );

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
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
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return product ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('common.name')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {product.name}
              </Typography>
            </Paper>
          </Grid>

          {/* OBH Attributes Section */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                width: '100%',
                color: (theme.vars || theme).palette.grey[500],
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              {t('product.form.obhSectionTitle')}
            </Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">
                {t('obh.name.division')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('OBH_DIVISION')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('obh.name.brand')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('OBH_BRAND')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">
                {t('obh.name.subbrand')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('OBH_SUBBRAND')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">
                {t('obh.name.product')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('OBH_PRODUCT')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">
                {t('obh.name.variant')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('OBH_VARIANT')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('obh.name.size')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('OBH_SIZE')}
              </Typography>
            </Paper>
          </Grid>

          {/* GPC Attributes Section */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                width: '100%',
                color: (theme.vars || theme).palette.grey[500],
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              {t('product.form.gpcSectionTitle')}
            </Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('gpc.segment')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('GPC_SEGMENT')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('gpc.family')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('GPC_FAMILY')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('gpc.class')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('GPC_CLASS')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">{t('gpc.brick')}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getAttributeValue('GPC_BRICK')}
              </Typography>
            </Paper>
          </Grid>

          {/* Metadata Section */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                width: '100%',
                color: (theme.vars || theme).palette.grey[500],
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              {t('common.metadata')}
            </Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">
                {t('common.createdAt')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(product.createdAt).format('MMMM D, YYYY')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">
                {t('common.updatedAt')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(product.updatedAt).format('MMMM D, YYYY')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleProductEdit}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleProductDelete}
            >
              {t('common.delete')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    ) : null;
  }, [
    isLoading,
    error,
    product,
    handleBack,
    handleProductDelete,
    handleProductEdit,
    getAttributeValue,
    t,
  ]);

  const pageTitle = `${product ? product.name : ''}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        {
          title: t('products.title'),
          path: '/org/' + organization?.id + '/config/products',
        },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
