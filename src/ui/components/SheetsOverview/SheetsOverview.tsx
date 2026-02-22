import { DataGrid } from '@mui/x-data-grid/DataGrid';
import React from 'react';
import { useSheets } from '../../hooks/useSheets/useSheets';
import {
  useIsOrgAdmin,
  useOrganization,
  useOrgUserId,
  useIsCloudAdmin,
  useUserOrganizationContext,
} from '../../context/UserOrganizationContext/UserOrganizationProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { gridClasses } from '@mui/x-data-grid';
import {
  GridColDef,
  GridFilterModel,
  GridLogicOperator,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid/models';
import { GridColumnVisibilityModel } from '@mui/x-data-grid/hooks/features/columns';
import { GridActionsCellItem } from '@mui/x-data-grid/components/cell';
import { SheetDocument } from '../../../api/ColabriAPI';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { useNavigate } from 'react-router';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ResolvedPrplsProvider, {
  useCachedResolvedPrpl,
} from '../../context/PrplsContext/ResolvedPrplsProvider';
import IdentityDisplay from '../IdentityDisplay/IdentityDisplay';
import { useDeleteDocument } from '../../hooks/useDocuments/useDocuments';
import { useTranslation } from 'react-i18next';

const INITIAL_PAGE_SIZE = 10;

export type SheetsOverviewProps = {
  scope?: {
    type: 'my' | 'shared' | 'lib';
    libraryId?: string;
  };
  showSheetActions?: boolean;
  renderTopActions?: () => React.ReactNode;
  handleClick?: (params: SheetDocument) => void;
};

function SheetsOverview(props: SheetsOverviewProps) {
  const { t } = useTranslation();
  const {
    scope,
    handleClick,
    showSheetActions = true,
    renderTopActions,
  } = props;

  const organization = useOrganization();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const orgUserId = useOrgUserId();
  const isOrgAdmin = useIsOrgAdmin();
  const isCloudAdmin = useIsCloudAdmin();
  const { prpls } = useUserOrganizationContext();
  const { deleteDocument } = useDeleteDocument(organization?.id || '');

  // Create the states for pagination, filtering, sorting, and column visibility
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: INITIAL_PAGE_SIZE,
    });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({ updatedAt: false });

  // Default quick filter logic operator to 'or'
  filterModel.quickFilterLogicOperator = GridLogicOperator.Or;

  const activeFilterItems = [...filterModel.items];

  // Apply the right filtering based on the scope
  if (scope?.type === 'my' && orgUserId && organization) {
    activeFilterItems.push({
      id: 'scope-my-1',
      field: 'owner',
      operator: 'equals',
      value: `${organization?.id}/u/${orgUserId}`,
    });
    activeFilterItems.push({
      id: 'scope-my-2',
      field: 'containerType',
      operator: 'doesNotEqual',
      value: 'library',
    });
  } else if (scope?.type === 'shared' && orgUserId && organization) {
    activeFilterItems.push({
      id: 'scope-shared-1',
      field: 'owner',
      operator: 'doesNotEqual',
      value: `${organization?.id}/u/${orgUserId}`,
    });
    activeFilterItems.push({
      id: 'scope-shared-2',
      field: 'containerType',
      operator: 'doesNotEqual',
      value: 'library',
    });
  } else if (scope?.type === 'lib' && orgUserId && organization) {
    activeFilterItems.push({
      id: 'scope-lib',
      field: 'containerType',
      operator: 'equals',
      value: 'library',
    });
    activeFilterItems.push({
      id: 'scope-lib',
      field: 'container',
      operator: 'equals',
      value: scope.libraryId,
    });
  }

  // All filterable column fields for quick filter
  const allFilterableFields = React.useMemo(
    () => ['name', 'type', 'owner', 'createdBy'],
    [],
  );

  // Use React Query hook for fetching sheets
  const {
    sheets,
    isLoading,
    refetch: refetchSheets,
  } = useSheets(organization?.id || '', {
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
    sort: sortModel.map((item) => ({
      field: item.field,
      direction: item.sort === 'asc' ? 'asc' : 'desc',
    })),
    filter: {
      items: activeFilterItems.map((item) => ({
        id: item.id ? `${item.field}-${item.operator}` : item.id + '',
        field: item.field,
        operator: item.operator,
        value: item.value?.toString(),
      })),
      logicOperator: (filterModel.logicOperator as 'and' | 'or') || 'and',
      quickFilterValues: filterModel.quickFilterValues,
      quickFilterLogicOperator:
        (filterModel.quickFilterLogicOperator as 'and' | 'or') || 'and',
      quickFilterFields: (() => {
        const quickFilterFields = [];
        for (const field of allFilterableFields) {
          if (
            columnVisibilityModel[field] ||
            !filterModel.quickFilterExcludeHiddenColumns
          ) {
            quickFilterFields.push(field);
          }
        }
        return quickFilterFields;
      })(),
    },
  });

  // Extract all the prpls from the sheets that we potentially need to display
  const sheetPrpls = React.useMemo(() => {
    const prplSet = new Set<string>();
    sheets.forEach((sheet) => {
      if (sheet.owner) {
        prplSet.add(sheet.owner);
      }
      if (sheet.createdBy) {
        prplSet.add(sheet.createdBy);
      }
      if (sheet.updatedBy) {
        prplSet.add(sheet.updatedBy);
      }
    });
    return Array.from(prplSet);
  }, [sheets]);

  // When a sheet is to be deleted
  const handleSheetDelete = React.useCallback(
    (sheet: SheetDocument) => async () => {
      const sheetName = sheet.name || 'this sheet';
      const confirmed = await dialogs.confirm(
        t('sheets.messages.deleteConfirm', { name: sheetName }),
        {
          title: t('sheets.messages.deleteTitle'),
          severity: 'error',
          okText: t('common.delete'),
          cancelText: t('common.cancel'),
        },
      );

      if (confirmed) {
        try {
          // Delete the document
          await deleteDocument(sheet.id!);

          notifications.show(
            t('sheets.messages.deleteSuccess', { name: sheetName }),
            {
              severity: 'success',
              autoHideDuration: 3000,
            },
          );
        } catch (deleteError) {
          notifications.show(
            t('sheets.messages.deleteError', {
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
    [dialogs, notifications, deleteDocument, t],
  );

  // When a sheet is to be added
  const handleSheetCreate = React.useCallback(() => {
    navigate(`/org/${organization?.id}/sheets/new`);
  }, [organization, navigate]);

  // When a sheet is clicked for editing
  const handleRowEdit = React.useCallback(
    (sheet: SheetDocument) => async () => {
      navigate(`/org/${organization?.id}/sheets/${sheet.id}`);
    },
    [organization, navigate],
  );

  // When the refresh button is clicked
  const handleRefresh = React.useCallback(() => {
    refetchSheets();
  }, [refetchSheets]);

  // When the sheet is clicked for inspection
  const defaultHandleClick = React.useCallback(
    (sheet: SheetDocument) => {
      navigate(`/org/${organization?.id}/sheets/${sheet.id}`);
    },
    [organization, navigate],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'name',
        headerName: t('sheets.columns.name'),
        width: 250,
        flex: 1,
      },
      {
        field: 'owner',
        headerName: t('sheets.columns.owner'),
        width: 150,
        renderCell: (row) => (
          <IdentityDisplay
            inTable={true}
            resolvedPrpl={useCachedResolvedPrpl(row.row.owner)}
          />
        ),
      },
      {
        field: 'createdBy',
        headerName: t('sheets.columns.createdBy'),
        width: 150,
        renderCell: (row) => (
          <IdentityDisplay
            inTable={true}
            resolvedPrpl={useCachedResolvedPrpl(row.row.createdBy)}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('sheets.columns.createdAt'),
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'updatedBy',
        headerName: t('sheets.columns.updatedBy'),
        width: 150,
        renderCell: (row) => (
          <IdentityDisplay
            inTable={true}
            resolvedPrpl={useCachedResolvedPrpl(row.row.updatedBy)}
          />
        ),
      },
      {
        field: 'updatedAt',
        headerName: t('sheets.columns.updatedAt'),
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
        width: 100,
        getActions: showSheetActions
          ? (params) => {
              // Can you delete the sheet?
              const canDelete =
                isCloudAdmin || isOrgAdmin || prpls?.includes(params.row.owner);

              // Generate the actions
              const actions = [];
              if (canDelete) {
                actions.push(
                  <GridActionsCellItem
                    key="delete-item"
                    icon={<DeleteIcon />}
                    label={t('common.delete')}
                    onClick={handleSheetDelete(params.row)}
                  />,
                );
              }
              actions.push(
                <GridActionsCellItem
                  key="edit-item"
                  icon={<EditIcon />}
                  label={t('common.edit')}
                  onClick={handleRowEdit(params.row)}
                />,
              );
              return actions;
            }
          : () => [],
      },
    ],
    [handleRowEdit, handleSheetDelete, showSheetActions, t],
  );

  return (
    <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        justifyContent="flex-end"
      >
        <Tooltip
          title={t('sheets.actions.reloadData')}
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
        {renderTopActions && renderTopActions()}
      </Stack>

      <ResolvedPrplsProvider prpls={sheetPrpls}>
        <DataGrid
          rows={sheets}
          rowCount={sheets.length}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          pagination
          showToolbar
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          sortModel={sortModel}
          onSortModelChange={(newModel) => setSortModel(newModel)}
          filterModel={filterModel}
          onFilterModelChange={(newModel) => setFilterModel(newModel)}
          disableRowSelectionOnClick
          onRowClick={(params) =>
            handleClick
              ? handleClick(params.row)
              : defaultHandleClick(params.row)
          }
          loading={isLoading}
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
              showQuickFilter: true,
              csvOptions: { disableToolbarButton: true },
              printOptions: { disableToolbarButton: true },
            },
          }}
        />
      </ResolvedPrplsProvider>
    </Stack>
  );
}

export default SheetsOverview;
