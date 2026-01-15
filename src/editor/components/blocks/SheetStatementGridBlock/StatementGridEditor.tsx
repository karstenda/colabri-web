import { LoroList, LoroMap } from 'loro-crdt';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import {
  SheetStatementGridRowLoro,
  StmtDocSchema,
} from '../../../data/ColabDoc';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import {
  ColabSheetStatementGridRow,
  StatementGridRowType,
} from '../../../../api/ColabriAPI';
import { useState, useMemo, useCallback } from 'react';
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid/models';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import getStmtNameColumn from './columns/StmtNameColumn';

export type StatementGridEditorProps = {
  stmtGridRowLoroList: LoroList<SheetStatementGridRowLoro>;
};

export type StatementGridEditorRow = {
  id: string;
  type: StatementGridRowType;
  statementRef?: string;
  statement?: LoroMap<StmtDocSchema>;
};

const StatementGridEditor: React.FC<StatementGridEditorProps> = ({
  stmtGridRowLoroList,
}) => {
  const { t } = useTranslation();
  const organization = useOrganization();

  // Convert LoroList into array of type StatementGridEditorRow and set is state
  const [statementRows, setStatementRows] = useState<StatementGridEditorRow[]>(
    () => {
      const initStatementRows: StatementGridEditorRow[] = [];
      for (let i = 0; i < stmtGridRowLoroList.length; i++) {
        const row = stmtGridRowLoroList.get(i);
        initStatementRows.push({
          id: row.id,
          type: row.get('type'),
          statementRef: row.get('statementRef'),
          statement: row.get('statement'),
        });
      }
      return initStatementRows;
    },
  );

  // Create states for filter, sort, and column visibility
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({});

  const handleRowClick = useCallback(
    (params: { row: StatementGridEditorRow }) => {
      console.log('Row clicked:', params.row);
    },
    [],
  );

  const columns = useMemo(() => [getStmtNameColumn(t)], [t]);

  const gridSx = useMemo(
    () => ({
      [`&`]: { border: '0px' },
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
    }),
    [],
  );

  const gridSlotProps = useMemo(
    () => ({
      loadingOverlay: {
        variant: 'circular-progress' as const,
        noRowsVariant: 'circular-progress' as const,
      },
      baseIconButton: {
        size: 'small' as const,
      },
      toolbar: {
        quickFilterProps: {
          debounceMs: 500,
        },
        showQuickFilter: true,
        csvOptions: { disableToolbarButton: true },
        printOptions: { disableToolbarButton: true },
      },
    }),
    [],
  );

  return (
    <>
      <DataGrid
        rows={statementRows}
        rowCount={statementRows.length}
        columns={columns}
        showToolbar
        hideFooter
        disableRowSelectionOnClick
        sortingMode="client"
        filterMode="client"
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        onRowClick={handleRowClick}
        sx={gridSx}
        slotProps={gridSlotProps}
      />
    </>
  );
};

export default StatementGridEditor;
