import { DataGrid } from '@mui/x-data-grid/DataGrid';
import React from 'react';
import { useStatements } from '../../hooks/useStatements/useStatements';
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
  GridRowId,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid/models';
import { GridColumnVisibilityModel } from '@mui/x-data-grid/hooks/features/columns';
import { GridActionsCellItem } from '@mui/x-data-grid/components/cell';
import { StatementDocument } from '../../../api/ColabriAPI';
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

export type StatementsOverviewProps = {
  scope?: {
    type: 'my' | 'shared' | 'lib';
    libraryId?: string;
  };
  handleClick?: (params: StatementDocument) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedStatements: StatementDocument[]) => void;
  showStatementActions?: boolean;
  renderTopActions?: () => React.ReactNode;
};

function StatementsOverview(props: StatementsOverviewProps) {
  const { t } = useTranslation();
  const {
    scope,
    handleClick,
    selectable = false,
    onSelectionChange,
    showStatementActions = true,
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
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: 'include',
      ids: new Set<GridRowId>([]),
    });

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

  // Use React Query hook for fetching statements
  const {
    statements,
    isLoading,
    refetch: refetchStatements,
  } = useStatements(organization?.id || '', {
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

  // Extract all the prpls from the statements that we potentially need to display
  const statementPrpls = React.useMemo(() => {
    const prplSet = new Set<string>();
    statements.forEach((statement) => {
      if (statement.owner) {
        prplSet.add(statement.owner);
      }
      if (statement.createdBy) {
        prplSet.add(statement.createdBy);
      }
      if (statement.updatedBy) {
        prplSet.add(statement.updatedBy);
      }
    });
    return Array.from(prplSet);
  }, [statements]);

  // When a statement is to be deleted
  const handleStatementDelete = React.useCallback(
    (statement: StatementDocument) => async () => {
      const statementName = statement.name || 'this statement';
      const confirmed = await dialogs.confirm(
        t('statements.messages.deleteConfirm', { name: statementName }),
        {
          title: t('statements.messages.deleteTitle'),
          severity: 'error',
          okText: t('common.delete'),
          cancelText: t('common.cancel'),
        },
      );

      if (confirmed) {
        try {
          // Delete the document
          await deleteDocument(statement.id!);

          notifications.show(
            t('statements.messages.deleteSuccess', { name: statementName }),
            {
              severity: 'success',
              autoHideDuration: 3000,
            },
          );
        } catch (deleteError) {
          notifications.show(
            t('statements.messages.deleteError', {
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

  // When a statement is clicked for editing
  const handleRowEdit = React.useCallback(
    (statement: StatementDocument) => async () => {
      navigate(`/org/${organization?.id}/statements/${statement.id}/edit`);
    },
    [organization, navigate],
  );

  // When the refresh button is clicked
  const handleRefresh = React.useCallback(() => {
    refetchStatements();
  }, [refetchStatements]);

  // When the row selection changes
  const handleRowSelectionModelChange = React.useCallback(
    (newModel: GridRowSelectionModel) => {
      // Update the state
      setRowSelectionModel(newModel);
      // Execute the callback
      if (onSelectionChange) {
        // Get the corresponding rows
        const selectedStatements = [];
        for (const statement of statements) {
          if (newModel.type === 'include' && newModel.ids.has(statement.id!)) {
            selectedStatements.push(statement);
          }
        }
        onSelectionChange(selectedStatements);
      }
    },
    [onSelectionChange],
  );

  // When the statement is clicked for inspection
  const defaultHandleClick = React.useCallback(
    (statement: StatementDocument) => {
      navigate(`/org/${organization?.id}/statements/${statement.id}`);
    },
    [organization, navigate],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'name',
        headerName: t('statements.columns.name'),
        width: 250,
        flex: 1,
      },
      {
        field: 'owner',
        headerName: t('statements.columns.owner'),
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
        headerName: t('statements.columns.createdBy'),
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
        headerName: t('statements.columns.createdAt'),
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      {
        field: 'updatedBy',
        headerName: t('statements.columns.updatedBy'),
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
        headerName: t('statements.columns.updatedAt'),
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
        getActions: showStatementActions
          ? (params) => {
              // Can you delete the statement?
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
                    onClick={handleStatementDelete(params.row)}
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
    [handleRowEdit, handleStatementDelete, showStatementActions, t],
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
          title={t('statements.actions.reloadData')}
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

      <ResolvedPrplsProvider prpls={statementPrpls}>
        <DataGrid
          rows={statements}
          rowCount={statements.length}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          pagination
          checkboxSelection={selectable}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
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

export default StatementsOverview;
