import { LoroList, LoroMap } from 'loro-crdt';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import {
  SheetStatementGridRowLoro,
  StmtDocSchema,
} from '../../../data/ColabDoc';
import { DataGrid } from '@mui/x-data-grid';
import {
  ColabSheetStatementGridRow,
  StatementGridRowType,
} from '../../../../api/ColabriAPI';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  GridColDef,
  GridFilterModel,
  GridSortModel,
} from '@mui/x-data-grid/models';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import getStmtNameColumn from './columns/StmtNameColumn';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import getStmtLangColumn from './columns/StmtLangColumn';
import { useContentLanguages } from '../../../../ui/hooks/useContentLanguages/useContentLanguage';
import getStmtActionsColumn from './columns/StmtActionsColumn';

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
  const { colabDoc } = useColabDoc();
  const { t } = useTranslation();
  const organization = useOrganization();
  const { languages } = useContentLanguages(organization?.id);

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

  // Create state for the columns
  const [columns, setColumns] = useState<any[]>([]);

  // Create states for filter, sort, and column visibility
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({});

  // Handle updating columns
  const updateColumns = useCallback(() => {
    const newColumns: GridColDef<StatementGridEditorRow>[] = [
      getStmtNameColumn(t),
      getStmtActionsColumn(t),
    ];

    const propertiesMap = colabDoc?.getLoroDoc().getMap('properties');
    if (!propertiesMap) {
      setColumns(newColumns);
      return;
    }

    const langCodesLoro = propertiesMap.get('langCodes');
    if (langCodesLoro) {
      for (let i = 0; i < langCodesLoro.length; i++) {
        const langCode = langCodesLoro.get(i);
        const language = languages?.find((lang) => lang.code === langCode);
        if (language) {
          newColumns.push(getStmtLangColumn(language, t));
        }
      }
    }

    setColumns(newColumns);
  }, [colabDoc, languages, t]);

  // Make sure we update the columns when colabDoc or organization changes
  useEffect(() => {
    updateColumns();
  }, [updateColumns]);

  const handleRowClick = useCallback(
    (params: { row: StatementGridEditorRow }) => {
      console.log('Row clicked:', params.row);
    },
    [],
  );

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
        backgroundColor: 'transparent',
      },
      [`& .${gridClasses.row}:hovered`]: {
        backgroundColor: 'transparent',
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
        columns={columns}
        showToolbar
        hideFooter
        disableRowSelectionOnClick
        getRowHeight={() => 'auto'}
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
