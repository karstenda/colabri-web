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
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { useUsers, useDeleteUser } from '../../hooks/useUsers/useUsers';
import { User } from '../../../api/ColabriAPI';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import UserAvatar from '../../components/UserAvatar/UserAvatar';

const INITIAL_PAGE_SIZE = 10;

export default function UserListPage() {

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  // Create the states for pagination, filtering, sorting, and column visibility
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
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
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState<GridColumnVisibilityModel>(
    searchParams.get('columnVisibility')
      ? JSON.parse(searchParams.get('columnVisibility') ?? '')
      : { updatedAt: false },
  );

  // Default quick filter logic operator to 'or'
  filterModel.quickFilterLogicOperator = GridLogicOperator.Or;

  const { deleteUser, isPending: isDeletePending } = useDeleteUser(organization?.id || '');

  // All filterable column fields for quick filter
  const allFilterableFields = React.useMemo(() => 
    ['email', 'firstName', 'lastName', 'disabled', 'createdAt', 'updatedAt'],
    []
  );

  // Use React Query hook for fetching users
  const { 
    users, 
    isLoading, 
    error,
    refetch 
  } = useUsers(
    organization?.id || '', 
    { 
      limit: paginationModel.pageSize, 
      offset: paginationModel.page * paginationModel.pageSize,
      sort: sortModel.map(item => ({
        field: item.field,
        direction: item.sort === 'asc' ? 'asc' : 'desc'
      })),
      filter: {
        items: filterModel.items.map(item => ({
          id: item.id ? `${item.field}-${item.operator}` : item.id+"",
          field: item.field,
          operator: item.operator,
          value: item.value?.toString()
        })),
        logicOperator: (filterModel.logicOperator as 'and' | 'or') || 'and',
        quickFilterValues: filterModel.quickFilterValues,
        quickFilterLogicOperator: (filterModel.quickFilterLogicOperator as 'and' | 'or') || 'and',
        quickFilterFields: (() => {
          const quickFilterFields = [];
          for (const field of allFilterableFields) {
            if (columnVisibilityModel[field] || !filterModel.quickFilterExcludeHiddenColumns) {
              quickFilterFields.push(field);
            }
          }
          return quickFilterFields;
        })()
      },
    }
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
      navigate(`/org/${organization?.id}/users/${row.id}`);
    },
    [navigate],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate(`/org/${organization?.id}/users/new`);
  }, [navigate]);

  const handleRowEdit = React.useCallback(
    (user: User) => () => {
      navigate(`/org/${organization?.id}/users/${user.id}/edit`);
    },
    [navigate],
  );

  const handleRowDelete = React.useCallback(
    (user: User) => async () => {
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email || 'this user';
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${userName}?`,
        {
          title: `Delete user?`,
          severity: 'error',
          okText: 'Delete',
          cancelText: 'Cancel',
        },
      );

      if (confirmed) {
        try {
          await deleteUser(user.id!);

          notifications.show('User deleted successfully.', {
            severity: 'success',
            autoHideDuration: 3000,
          });
        } catch (deleteError) {
          notifications.show(
            `Failed to delete user. Reason: ${(deleteError as Error).message}`,
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
      }
    },
    [dialogs, notifications],
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
        renderCell: (params) => (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <UserAvatar
              user={params.row}
              width={35}
              height={35}
            />
          </div>
        ),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        resizable: false,
        disableReorder: true,
      },
      { field: 'email', headerName: 'Email', width: 250 },
      { field: 'firstName', headerName: 'First Name', width: 150 },
      { field: 'lastName', headerName: 'Last Name', width: 150 },
      {
        field: 'disabled',
        headerName: 'Disabled',
        type: 'boolean',
        width: 100,
        renderCell: (params) => {
          const isDisabled = params.row.disabled;
          if (isDisabled) {
            return (<div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <PersonOffIcon />
            </div>);
          } else {
            return <></>
          }
        },
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
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
            label="Edit"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete],
  );

  const pageTitle = 'Users';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Create
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
            rows={users}
            rowCount={users.length}
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
