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
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import { Avatar, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import {
  useCountries,
  useAddCountries,
  useRemoveCountries,
} from '../../hooks/useCountries/useCountries';
import { AddCountryModal, AddCountryModalPayload } from './AddCountryModal';
import type { OrgCountry } from '../../../api/ColabriAPI';

export default function CountryListPage() {
  const { t } = useTranslation();
  const theme = useTheme();

  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const { removeCountries, isPending: isDeletePending } = useRemoveCountries(
    organization?.id || '',
  );
  const { addCountries, isPending: isAddPending } = useAddCountries(
    organization?.id || '',
  );

  const { countries, isLoading, error, refetch } = useCountries(
    organization?.id || '',
    !!organization?.id,
  );

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  const handleCreateClick = React.useCallback(async () => {
    if (!organization?.id) return;

    const countryCodes = await dialogs.open<AddCountryModalPayload, string[]>(
      AddCountryModal,
      {
        orgId: organization.id,
      },
    );

    if (countryCodes && countryCodes.length > 0) {
      try {
        await addCountries(countryCodes);
        notifications.show(
          t('countries.messages.addedSuccess', { count: countryCodes.length }),
          {
            severity: 'success',
            autoHideDuration: 3000,
          },
        );
      } catch (addError) {
        notifications.show(
          t('countries.messages.addedError', {
            count: countryCodes.length,
            error: (addError as Error).message,
          }),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [organization?.id, dialogs, addCountries, notifications, t]);

  const handleRowDelete = React.useCallback(
    (country: OrgCountry) => async () => {
      const confirmed = await dialogs.confirm(
        t('countries.messages.deleteConfirm', { name: country.name }),
        {
          title: t('countries.messages.deleteConfirmTitle'),
          severity: 'error',
          okText: t('common.delete'),
          cancelText: t('common.cancel'),
        },
      );

      if (!confirmed) {
        return;
      }

      if (!country.id) {
        notifications.show(t('countries.messages.deleteMissingId'), {
          severity: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      try {
        await removeCountries([country.id]);
        notifications.show(t('countries.messages.deleteSuccess'), {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          t('countries.messages.deleteError', {
            error: (deleteError as Error).message,
          }),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    },
    [dialogs, notifications, t, removeCountries],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'icon',
        headerName: '',
        width: 50,
        renderCell: (params) => (
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
              <FlagCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </div>
        ),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        resizable: false,
        disableReorder: true,
      },
      { field: 'name', headerName: t('countries.columns.name'), width: 250 },
      { field: 'code', headerName: t('countries.columns.code'), width: 120 },
      {
        field: 'continent',
        headerName: t('countries.columns.continent'),
        width: 150,
      },
      {
        field: 'languages',
        headerName: t('countries.columns.languages'),
        width: 200,
        renderCell: (params) => (
          <span>{params.row.languages?.join(', ') || 'N/A'}</span>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label={t('common.delete')}
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowDelete, t, theme.palette.grey],
  );

  const pageTitle = t('countries.title');

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
            {t('countries.addCountry')}
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
            rows={countries}
            columns={columns}
            sortingMode="client"
            filterMode="client"
            sortModel={sortModel}
            onSortModelChange={(model) => setSortModel(model)}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            disableRowSelectionOnClick
            loading={isLoading || isDeletePending || isAddPending}
            hideFooter
            showToolbar
            getRowId={(row) =>
              row.id || row.code || `${row.name || 'country'}-${row.continent}`
            }
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
