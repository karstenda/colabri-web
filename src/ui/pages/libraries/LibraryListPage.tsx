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
  GridPaginationModel,
  GridSortModel,
  GridEventListener,
  gridClasses,
  GridColumnVisibilityModel,
  GridLogicOperator,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import Avatar from '@mui/material/Avatar';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  useLibraries,
  useDeleteLibrary,
  Library,
} from '../../hooks/useLibraries/useLibraries';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useTheme } from '@mui/material/styles';
import { DocumentType } from '../../../api/ColabriAPI';

const INITIAL_PAGE_SIZE = 10;

export default function LibraryListPage() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  // Create the states for pagination, filtering, sorting, and column visibility
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
      pageSize: searchParams.get('pageSize')
        ? Number(searchParams.get('pageSize'))
        : INITIAL_PAGE_SIZE,
    });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] },
  );
  const [sortModel, setSortModel] = React.useState<GridSortModel>(
    searchParams.get('sort') ? JSON.parse(searchParams.get('sort') ?? '') : [],
  );
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>(
      searchParams.get('columnVisibility')
        ? JSON.parse(searchParams.get('columnVisibility') ?? '')
        : { updatedAt: false },
    );

  // Default quick filter logic operator to 'or'
  filterModel.quickFilterLogicOperator = GridLogicOperator.Or;

  const { deleteLibrary, isPending: isDeletePending } = useDeleteLibrary(
    organization?.id || '',
  );

  // All filterable column fields for quick filter
  const allFilterableFields = React.useMemo(
    () => ['name', 'description', 'system', 'createdAt', 'updatedAt'],
    [],
  );

  // Use React Query hook for fetching libraries
  const { libraries, isLoading, error, refetch } = useLibraries(
    organization?.id || '',
  );

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);

      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set('filter', JSON.stringify(model));
      } else {
        searchParams.delete('filter');
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleSortModelChange = React.useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      if (model.length > 0) {
        searchParams.set('sort', JSON.stringify(model));
      } else {
        searchParams.delete('sort');
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleColumnVisibilityModelChange = React.useCallback(
    (model: Record<string, boolean>) => {
      setColumnVisibilityModel(model);

      if (Object.keys(model).length > 0) {
        searchParams.set('columnVisibility', JSON.stringify(model));
      } else {
        searchParams.delete('columnVisibility');
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      navigate(`/org/${organization?.id}/config/libraries/${row.id}`);
    },
    [navigate, organization?.id],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/libraries/new`);
  }, [navigate, organization?.id]);

  const handleRowEdit = React.useCallback(
    (library: Library) => () => {
      navigate(`/org/${organization?.id}/config/libraries/${library.id}/edit`);
    },
    [navigate, organization?.id],
  );

  const handleRowDelete = React.useCallback(
    (library: Library) => async () => {
      const libraryName = library.name || 'this library';
      const confirmed = await dialogs.confirm(
        t(
          'libraries.confirmDelete.message',
          'Do you wish to delete {{name}}?',
          { name: libraryName },
        ),
        {
          title: t('libraries.confirmDelete.title', 'Delete library?'),
          severity: 'error',
          okText: t('common.delete', 'Delete'),
          cancelText: t('common.cancel', 'Cancel'),
        },
      );

      if (confirmed) {
        try {
          await deleteLibrary(library.id!);

          notifications.show(
            t(
              'libraries.notifications.deleted',
              'Library deleted successfully.',
            ),
            {
              severity: 'success',
              autoHideDuration: 3000,
            },
          );
        } catch (deleteError) {
          notifications.show(
            t(
              'libraries.notifications.deleteFailed',
              `Failed to delete library. Reason: {{reason}}`,
              { reason: (deleteError as Error).message },
            ),
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
      }
    },
    [dialogs, notifications, deleteLibrary, t],
  );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'Avatar',
        headerName: '',
        width: 50,
        renderCell: () => (
          <div
            style={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: theme.palette.grey[400],
              }}
            >
              <LocalLibraryIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </div>
        ),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        resizable: false,
        disableReorder: true,
      },
      {
        field: 'name',
        headerName: t('common.name', 'Name'),
        width: 200,
      },
      {
        field: 'type',
        headerName: t('libraries.fields.type', 'Type'),
        width: 200,
        flex: 1,
        renderCell: (params) => {
          const type = params.row.type;
          if (type === DocumentType.DocumentTypeColabStatement) {
            return <>{t('statements.type')}</>;
          } else if (type === DocumentType.DocumentTypeColabSheet) {
            return <>{t('sheets.type')}</>;
          } else {
            return <>{type}</>;
          }
        },
      },
      {
        field: 'createdAt',
        headerName: t('common.createdAt', 'Created'),
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'updatedAt',
        headerName: t('common.updatedAt', 'Updated'),
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        width: 100,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label={t('common.edit', 'Edit')}
            onClick={handleRowEdit(row)}
            disabled={row.system}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label={t('common.delete', 'Delete')}
            onClick={handleRowDelete(row)}
            disabled={row.system}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete, theme.palette.grey, t],
  );

  const pageTitle = t('libraries.title', 'Libraries');

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip
            title={t('common.refresh', 'Reload data')}
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
            {t('common.create', 'Create')}
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
            rows={libraries}
            rowCount={libraries.length}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading || isDeletePending}
            initialState={initialState}
            showToolbar
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
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
