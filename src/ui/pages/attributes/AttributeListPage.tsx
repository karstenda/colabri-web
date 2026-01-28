import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LabelIcon from '@mui/icons-material/Label';
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
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  useAttributes,
  useDeleteAttribute,
} from '../../hooks/useAttributes/useAttributes';
import { Attribute } from '../../../api/ColabriAPI';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';

export default function AttributeListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const { deleteAttribute, isPending: isDeletePending } = useDeleteAttribute(
    organization?.id || '',
  );

  // Use React Query hook for fetching attributes
  const { attributes, isLoading, error, refetch } = useAttributes(
    organization?.id || '',
  );

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      navigate(`/org/${organization?.id}/config/attributes/${row.id}`);
    },
    [navigate, organization],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/attributes/new`);
  }, [navigate, organization]);

  const handleRowEdit = React.useCallback(
    (attribute: Attribute) => () => {
      navigate(
        `/org/${organization?.id}/config/attributes/${attribute.id}/edit`,
      );
    },
    [navigate, organization],
  );

  const handleRowDelete = React.useCallback(
    (attribute: Attribute) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete the attribute "${attribute.name}"?`,
        {
          title: `Delete attribute?`,
          severity: 'error',
          okText: 'Delete',
          cancelText: 'Cancel',
        },
      );

      if (confirmed) {
        try {
          await deleteAttribute(attribute.id!);

          notifications.show('Attribute deleted successfully.', {
            severity: 'success',
            autoHideDuration: 3000,
          });
        } catch (deleteError) {
          notifications.show(
            `Failed to delete attribute. Reason: ${(deleteError as Error).message}`,
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
      }
    },
    [dialogs, notifications, deleteAttribute],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'Icon',
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
              <LabelIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </div>
        ),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        resizable: false,
        disableReorder: true,
      },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
      {
        field: 'type',
        headerName: 'Type',
        width: 150,
        valueFormatter: (value) => {
          const typeMap: Record<string, string> = {
            string: 'String',
            number: 'Number',
            boolean: 'Boolean',
            date: 'Date',
          };
          return typeMap[value] || value;
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

  const pageTitle = 'Attributes';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
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
            rows={attributes}
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
