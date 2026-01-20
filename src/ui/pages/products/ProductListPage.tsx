import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridSortModel,
  GridEventListener,
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  useProducts,
  useDeleteProduct,
} from '../../hooks/useProducts/useProducts';
import { OrgProduct } from '../../../api/ColabriAPI';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const { deleteProduct, isPending: isDeletePending } = useDeleteProduct(
    organization?.id || '',
  );

  // Use React Query hook for fetching products
  const { products, isLoading, error, refetch } = useProducts(
    organization?.id || '',
  );

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      navigate(`/org/${organization?.id}/config/products/${row.id}`);
    },
    [navigate, organization],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/products/new`);
  }, [navigate, organization]);

  const handleRowEdit = React.useCallback(
    (product: OrgProduct) => () => {
      navigate(`/org/${organization?.id}/config/products/${product.id}/edit`);
    },
    [navigate, organization],
  );

  const handleRowDelete = React.useCallback(
    (product: OrgProduct) => async () => {
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
          await deleteProduct(product.id!);

          notifications.show(t('products.deleteSuccess'), {
            severity: 'success',
            autoHideDuration: 3000,
          });
        } catch (deleteError) {
          notifications.show(
            t('products.deleteError', {
              reason: (deleteError as Error).message,
            }),
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
      }
    },
    [dialogs, notifications, deleteProduct, t],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'name', headerName: t('common.name'), flex: 1, minWidth: 200 },
      {
        field: 'createdAt',
        headerName: t('common.created'),
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'updatedAt',
        headerName: t('common.updated'),
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label={t('common.edit')}
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label={t('common.delete')}
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete, t],
  );

  const pageTitle = t('products.title');

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip
            title={t('common.refresh')}
            placement="right"
            enterDelay={1000}
          >
            <div>
              <IconButton
                size="small"
                aria-label="refresh"
                onClick={handleRefresh}
              >
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            {t('common.create')}
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={products}
            columns={columns}
            sortingMode="client"
            filterMode="client"
            sortModel={sortModel}
            onSortModelChange={(model) => setSortModel(model)}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading || isDeletePending}
            hideFooter
            showToolbar
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: 'none',
                },
              [`& .${gridClasses.row}:hover`]: {
                cursor: 'pointer',
              },
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
              baseIconButton: {
                size: 'small',
              },
              toolbar: {
                quickFilterProps: {
                  debounceMs: 500,
                },
                csvOptions: { disableToolbarButton: true },
                printOptions: { disableToolbarButton: true },
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
