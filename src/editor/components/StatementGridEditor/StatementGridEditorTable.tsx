import { ContainerID, LoroList, LoroMap, LoroMovableList } from 'loro-crdt';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import {
  SheetStatementGridBlockLoro,
  SheetStatementGridRowLoro,
  StmtDocSchema,
  StmtRefSchema,
  TextElementLoro,
} from '../../data/ColabLoroDoc';
import { DataGrid, GridRow } from '@mui/x-data-grid';
import { StatementGridRowType } from '../../../api/ColabriAPI';
import { useState, useMemo, useCallback, useEffect, use } from 'react';
import {
  GridColDef,
  GridFilterModel,
  GridSlotsComponentsProps,
  GridSortModel,
} from '@mui/x-data-grid/models';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import getStmtTypeColumn from './columns/StmtTypeColumn';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useContentLanguages } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import getStmtActionsColumn from './columns/StmtActionsColumn';
import StatementGridEditorToolbar from './StatementGridEditorToolbar';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import AddStatementModal, {
  AddStatementModalPayload,
  NewStatementData,
} from './AddStatementModal';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../data/ColabDoc';
import { useTheme } from '@mui/material/styles';
import getStmtEditColumn from './columns/StmtEditColumn';
import { useSetActiveCell } from './context/StatementGridEditorContextProvider';
import StatementGridEditorRow from './rows/StatementGridEditorRow';

export type StatementGridEditorTableProps = {
  containerId: ContainerID;
  isHovered?: boolean;
  isFocused?: boolean;
  readOnly?: boolean;
};

export type StatementGridEditorTableRow = {
  id: string;
  type: StatementGridRowType;
  statementRef?: LoroMap<StmtRefSchema>;
  statement?: LoroMap<StmtDocSchema>;
};

const StatementGridEditorTable: React.FC<StatementGridEditorTableProps> = ({
  containerId,
  isHovered,
  isFocused,
  readOnly = false,
}) => {
  const { colabDoc } = useColabDoc();
  const { t } = useTranslation();
  const theme = useTheme();
  const organization = useOrganization();
  const { languages } = useContentLanguages(organization?.id);
  const setActiveCell = useSetActiveCell();
  const dialogs = useDialogs();

  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error('StatementGridEditor can only be used with sheet docs.');
  }

  // Get the LoroDoc and Controller
  const loroDoc = colabDoc?.getLoroDoc();
  const controller = colabDoc?.getDocController();

  // Create state for canEdit and canManage
  const [canAdd, setCanAdd] = useState<boolean>(false);
  const [canManage, setCanManage] = useState<boolean>(false);

  // Create state for the rows
  const [statementRows, setStatementRows] = useState<
    StatementGridEditorTableRow[]
  >([]);

  // Create state for the columns
  const [columns, setColumns] = useState<any[]>([]);

  // Wether to show outlines on the title
  const showTitleOutlines = (isFocused || isHovered) && canManage;

  // Create state for the title container
  const [titleContainerId, setTitleContainerId] = useState<
    ContainerID | undefined
  >(undefined);

  // Create states for filter, sort, and column visibility
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({});

  // On load of loroDoc or containerId
  useEffect(() => {
    if (loroDoc && containerId) {
      // Update the state
      setCanManage(controller.hasManageBlockPermission(containerId));
      setCanAdd(controller.hasAddRemoveToBlockPermission(containerId));

      // Target the container
      const container = loroDoc.getContainerById(
        containerId,
      ) as SheetStatementGridBlockLoro;
      if (!container) {
        throw new Error(
          `Container with id ${containerId} not found in LoroDoc.`,
        );
      }

      // Target the title container
      const titleLoro = container.get('title') as TextElementLoro;

      // Target the rows
      const stmtGridRowLoroList = container.get(
        'rows',
      ) as LoroMovableList<SheetStatementGridRowLoro>;

      // Target the global properties map
      const propertiesMap = loroDoc?.getMap('properties');

      // Update state for the columns
      updateColumns(propertiesMap);

      // Update state for the rows
      updateRows(stmtGridRowLoroList);

      // Update state for the title container
      setTitleContainerId(titleLoro.id);

      // Subscribe to changes in the rows list
      const unsubscribeRows = controller.subscribeToRowListChanges(
        containerId,
        () => {
          // On any row change, update the rows
          updateRows(stmtGridRowLoroList);
        },
      );

      // Subscribe to ACL changes in the loroDoc
      const unsubscribeAcls = controller.subscribeToBlockAclChanges(
        containerId,
        () => {
          // On any ACL change, update the canEdit state
          setCanManage(controller.hasManageBlockPermission(containerId));
          setCanAdd(controller.hasAddRemoveToBlockPermission(containerId));

          // This can affect the columns (actions column), so update them too
          updateColumns(propertiesMap);
        },
      );

      // Return unsubscribe function
      return () => {
        unsubscribeAcls();
        unsubscribeRows();
      };
    }
  }, [loroDoc, controller, containerId, languages]);

  useEffect(() => {
    // If the entire grid editor is not focused, clear the active cell
    if (!isFocused) {
      setActiveCell(null);
    }
  }, [isFocused]);

  // Handle updating columns
  const updateColumns = useCallback(
    (propertiesMap: LoroMap<any> | undefined) => {
      // Always display the name column and actions column
      const newColumns: GridColDef<StatementGridEditorTableRow>[] = [
        getStmtTypeColumn(t),
        getStmtActionsColumn(
          t,
          controller,
          containerId,
          canManage,
          canAdd,
          readOnly,
        ),
      ];

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
            newColumns.push(getStmtEditColumn(language, t));
          }
        }
      }

      setColumns(newColumns);
    },
    [loroDoc, languages, canManage, canAdd, t, containerId],
  );

  const updateRows = useCallback(
    (stmtGridRowLoroList: LoroMovableList<SheetStatementGridRowLoro>) => {
      // Create state for the rows
      const stmtRows: StatementGridEditorTableRow[] = [];
      for (let i = 0; i < stmtGridRowLoroList.length; i++) {
        const row = stmtGridRowLoroList.get(i);
        stmtRows.push({
          id: row.id,
          type: row.get('type'),
          statementRef: row.get('statementRef'),
          statement: row.get('statement'),
        });
      }
      setStatementRows(stmtRows);
    },
    [],
  );

  const handleStatementAdd = useCallback(async () => {
    const propertiesMap = loroDoc?.getMap('properties');
    const docLangCodes: string[] =
      propertiesMap?.get('langCodes')?.toArray() || [];
    const docLanguages = languages.filter((lang) =>
      docLangCodes.includes(lang.code),
    );

    // Get new statement data from the modal
    const newStatementData = await dialogs.open<
      AddStatementModalPayload,
      NewStatementData | undefined
    >(AddStatementModal, {
      docLanguages: docLanguages,
    });

    if (newStatementData && controller) {
      // Figure out the type
      let type: 'new' | 'live-reference' | 'frozen-reference' = 'new';
      if (newStatementData.statementSource === 'library') {
        type = 'frozen-reference';
      } else if (newStatementData.statementSource === 'my-statements') {
        type = 'live-reference';
      } else {
        type = 'new';
      }

      // Add the new statement via the controller
      const ok = controller.addStatementToStatementGridBlock(
        containerId,
        type,
        newStatementData,
      );
      if (ok) {
        controller.commit();
      }
    }
  }, [loroDoc, controller, languages, containerId, dialogs]);

  const handleRowClick = useCallback(
    (params: { row: StatementGridEditorTableRow }) => {
      console.log('Row clicked:', params.row);
    },
    [],
  );

  const handleCellClick = useCallback(
    (params: { row: StatementGridEditorTableRow; field: string }) => {
      setActiveCell({ rowId: params.row.id, field: params.field });
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
      [`& .${gridClasses.cell}`]: {
        padding: 0,
        backgroundColor: (theme.vars || theme).palette.background.paper,
      },
    }),
    [],
  );

  const gridSlotProps = useMemo<GridSlotsComponentsProps>(
    () => ({
      loadingOverlay: {
        variant: 'circular-progress' as const,
        noRowsVariant: 'circular-progress' as const,
      },
      baseIconButton: {
        size: 'small' as const,
      },
      toolbar: {
        canAdd: canAdd,
        canManage: canManage,
        titleContainerId: titleContainerId,
        showOutlines: showTitleOutlines,
        handleStatementAdd: handleStatementAdd,
        readOnly: readOnly,
      },
    }),
    [
      titleContainerId,
      showTitleOutlines,
      canAdd,
      canManage,
      handleStatementAdd,
    ],
  );

  const gridSlots = useMemo(
    () => ({
      toolbar: StatementGridEditorToolbar,
      row: StatementGridEditorRow,
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
        onCellClick={handleCellClick}
        sx={gridSx}
        slotProps={gridSlotProps}
        slots={gridSlots}
      />
    </>
  );
};

export default StatementGridEditorTable;
