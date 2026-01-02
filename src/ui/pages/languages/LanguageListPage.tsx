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
import FormatTextdirectionRToLIcon from '@mui/icons-material/FormatTextdirectionRToL';
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR';
import LanguageIcon from '@mui/icons-material/Language';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { OrgContentLanguage } from '../../../api/ColabriAPI';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useUserOrganizationContext } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import {
  useContentLanguages,
  useRemoveContentLanguages,
  useAddContentLanguage,
} from '../../hooks/useContentLanguages/useContentLanguage';
import { AddLanguageModal, AddLanguageModalPayload } from './AddLanguageModal';
import { Avatar, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function LanguageListPage() {
  const { t } = useTranslation();
  const theme = useTheme();

  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { organization } = useUserOrganizationContext();

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const { removeContentLanguages, isPending: isDeletePending } =
    useRemoveContentLanguages(organization?.id || '');
  const { addContentLanguage, isPending: isAddPending } = useAddContentLanguage(
    organization?.id || '',
  );

  // Use React Query hook for fetching languages
  const { languages, isLoading, error, refetch } = useContentLanguages(
    organization?.id || '',
  );

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  const handleCreateClick = React.useCallback(async () => {
    if (!organization?.id) return;

    const languageCodes = await dialogs.open<AddLanguageModalPayload, string[]>(
      AddLanguageModal,
      {
        orgId: organization.id,
      },
    );

    if (languageCodes && languageCodes.length > 0) {
      try {
        await addContentLanguage(languageCodes);

        notifications.show(
          t('languages.messages.addedSuccess', { count: languageCodes.length }),
          {
            severity: 'success',
            autoHideDuration: 3000,
          },
        );
      } catch (addError) {
        notifications.show(
          t('languages.messages.addedError', {
            count: languageCodes.length,
            error: (addError as Error).message,
          }),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [organization?.id, dialogs, addContentLanguage, notifications]);

  const handleRowDelete = React.useCallback(
    (language: OrgContentLanguage) => async () => {
      const confirmed = await dialogs.confirm(
        t('languages.messages.deleteConfirm', { name: language.name }),
        {
          title: t('languages.messages.deleteConfirmTitle'),
          severity: 'error',
          okText: t('common.delete'),
          cancelText: t('common.cancel'),
        },
      );

      if (confirmed) {
        try {
          await removeContentLanguages([language.id]);

          notifications.show(t('languages.messages.deleteSuccess'), {
            severity: 'success',
            autoHideDuration: 3000,
          });
        } catch (deleteError) {
          notifications.show(
            t('languages.messages.deleteError', {
              error: (deleteError as Error).message,
            }),
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
      }
    },
    [dialogs, notifications, t, removeContentLanguages],
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
              <LanguageIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </div>
        ),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        resizable: false,
        disableReorder: true,
      },
      { field: 'name', headerName: t('languages.columns.name'), width: 250 },
      { field: 'code', headerName: t('languages.columns.code'), width: 150 },
      {
        field: 'spellCheck',
        headerName: t('languages.columns.spellCheck'),
        width: 150,
        renderCell: (params) => (
          <span>
            {params.row.spellCheck
              ? t('languages.spellCheck.supported')
              : t('languages.spellCheck.notSupported')}
          </span>
        ),
      },
      {
        field: 'defaultFont',
        headerName: t('languages.columns.defaultFont'),
        width: 150,
        renderCell: (params) => (
          <span>{params.row.defaultFont.join(', ')}</span>
        ),
      },
      {
        field: 'textDirection',
        headerName: t('languages.columns.textDirection'),
        type: 'string',
        width: 100,
        renderCell: (params) => {
          const textDirection = params.row.textDirection;
          if (textDirection === 'ltr') {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <FormatTextdirectionLToRIcon />
              </div>
            );
          } else {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <FormatTextdirectionRToLIcon />
              </div>
            );
          }
        },
      },
      {
        field: 'Actions',
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

  const pageTitle = t('languages.title');

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
            {t('languages.addLanguage')}
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
            rows={languages}
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
