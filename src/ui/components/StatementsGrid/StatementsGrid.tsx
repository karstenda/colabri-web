import { DataGrid } from '@mui/x-data-grid/DataGrid';
import React from 'react';
import { useStatements } from '../../hooks/useStatements/useStatements';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
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

const INITIAL_PAGE_SIZE = 10;

export type StatementsGridProps = {
  editable?: boolean;
  handleClick?: (params: StatementDocument) => void;
};

function StatementsGrid(props: StatementsGridProps) {
  const { handleClick, editable = true } = props;

  const organization = useOrganization();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const navigate = useNavigate();

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
      items: filterModel.items.map((item) => ({
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
        `Do you wish to delete ${statementName}?`,
        {
          title: `Delete statement?`,
          severity: 'error',
          okText: 'Delete',
          cancelText: 'Cancel',
        },
      );

      if (confirmed) {
        try {
          // TODO: Implement deleteStatement when the hook is available
          // await deleteStatement(statement.id!);

          notifications.show(
            `Statement ${statementName} deleted successfully.`,
            {
              severity: 'success',
              autoHideDuration: 3000,
            },
          );
        } catch (deleteError) {
          notifications.show(
            `Failed to delete statement. Reason: ${
              (deleteError as Error).message
            }`,
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

  // When a statement is to be added
  const handleStatementCreate = React.useCallback(() => {
    navigate(`/org/${organization?.id}/statements/new`);
  }, [organization, navigate]);

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

  // When the statement is clicked for inspection
  const defaultHandleClick = React.useCallback(
    (statement: StatementDocument) => {
      navigate(`/org/${organization?.id}/statements/${statement.id}`);
    },
    [organization, navigate],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'name', headerName: 'Name', width: 250, flex: 1 },
      { field: 'type', headerName: 'Type', width: 150 },
      {
        field: 'owner',
        headerName: 'Owner',
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
        headerName: 'Created By',
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
        width: 100,
        getActions: editable
          ? (params) => [
              <GridActionsCellItem
                key="edit-item"
                icon={<EditIcon />}
                label="Edit"
                onClick={handleRowEdit(params.row)}
              />,
              <GridActionsCellItem
                key="delete-item"
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleStatementDelete(params.row)}
              />,
            ]
          : () => [],
      },
    ],
    [handleRowEdit, handleStatementDelete, editable],
  );

  return (
    <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
      {editable && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          justifyContent="flex-end"
        >
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
            onClick={handleStatementCreate}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        </Stack>
      )}

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

export default StatementsGrid;
