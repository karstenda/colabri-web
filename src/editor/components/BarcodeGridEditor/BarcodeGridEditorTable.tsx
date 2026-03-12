import { ContainerID, LoroMap, LoroMovableList } from 'loro-crdt';
import { useTranslation } from 'react-i18next';
import {
  SheetBarcodeGridBlockLoro,
  SheetBarcodeGridRowLoro,
  BarcodeDataLoro,
  TextElementLoro,
} from '../../data/ColabLoroDoc';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  GridColDef,
  GridFilterModel,
  GridSlotsComponentsProps,
  GridSortModel,
} from '@mui/x-data-grid/models';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../data/ColabDoc';
import { useTheme } from '@mui/material/styles';
import { useSetActiveCell } from '../ColabGridEditor/context/ColabGridEditorContextProvider';
import { ColabGridEditorTableRow } from '../ColabGridEditor/data/ColabGridEditorTableRow';
import getInstanceColumn from '../ColabGridEditor/columns/InstanceColumn';
import getBarcodePreviewColumn from './columns/BarcodePreviewColumn';
import getBarcodeDataColumn from './columns/BarcodeDataColumn';
import BarcodeGridEditorToolbar from './BarcodeGridEditorToolbar';
import getRowActionsColumn from '../ColabGridEditor/columns/RowActionsColumn';

export type BarcodeGridEditorTableProps = {
  containerId: ContainerID;
  isHovered?: boolean;
  isFocused?: boolean;
  readOnly?: boolean;
};

export type BarcodeGridEditorTableRow = ColabGridEditorTableRow & {
  barcode?: BarcodeDataLoro;
};

const BarcodeGridEditorTable: React.FC<BarcodeGridEditorTableProps> = ({
  containerId,
  isHovered,
  isFocused,
  readOnly = false,
}) => {
  const { colabDoc } = useColabDoc();
  const { t } = useTranslation();
  const theme = useTheme();
  const setActiveCell = useSetActiveCell();

  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error('BarcodeGridEditor can only be used with sheet docs.');
  }

  // Get the LoroDoc and Controller
  const loroDoc = colabDoc?.getLoroDoc();
  const controller = colabDoc?.getDocController();

  // Create state for canEdit and canManage
  const [canAdd, setCanAdd] = useState<boolean>(false);
  const [canManage, setCanManage] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [canApprove, setCanApprove] = useState<boolean>(false);

  // Create state for the rows
  const [barcodeRows, setBarcodeRows] = useState<BarcodeGridEditorTableRow[]>(
    [],
  );

  // Create state for the columns
  const [columns, setColumns] = useState<any[]>([]);

  // Whether to show outlines on the title
  const showTitleOutlines = useMemo(
    () => (isFocused || isHovered) && canManage,
    [isFocused, isHovered, canManage],
  );

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
      setCanEdit(controller.hasBlockEditPermission(containerId));
      setCanApprove(controller.hasBlockApprovePermission(containerId));

      // Target the container
      const container = loroDoc.getContainerById(
        containerId,
      ) as SheetBarcodeGridBlockLoro;
      if (!container) {
        throw new Error(
          `Container with id ${containerId} not found in LoroDoc.`,
        );
      }

      // Target the title container
      const titleLoro = container.get('title') as TextElementLoro;

      // Target the rows
      const barcodeGridRowLoroList = container.get(
        'rows',
      ) as LoroMovableList<SheetBarcodeGridRowLoro>;

      // Update state for the title container
      setTitleContainerId(titleLoro.id);

      // Update state for the rows
      updateRows(barcodeGridRowLoroList);

      // Subscribe to changes in the rows list
      const unsubscribeRows = controller.subscribeToRowListChanges(
        containerId,
        () => {
          updateRows(barcodeGridRowLoroList);
        },
      );

      // Subscribe to ACL changes in the loroDoc
      const unsubscribeAcls = controller.subscribeToBlockAclChanges(
        containerId,
        () => {
          setCanManage(controller.hasManageBlockPermission(containerId));
          setCanAdd(controller.hasAddRemoveToBlockPermission(containerId));
          setCanEdit(controller.hasBlockEditPermission(containerId));
          setCanApprove(controller.hasBlockApprovePermission(containerId));
        },
      );

      // Return unsubscribe function
      return () => {
        unsubscribeAcls();
        unsubscribeRows();
      };
    }
  }, [loroDoc, controller, containerId]);

  useEffect(() => {
    // If the entire grid editor is not focused, clear the active cell
    if (!isFocused) {
      setActiveCell(null);
    }
  }, [isFocused]);

  // Handle updating columns
  const updateColumns = useCallback(() => {
    const newColumns: GridColDef<BarcodeGridEditorTableRow>[] = [
      getBarcodePreviewColumn(t, controller),
      getBarcodeDataColumn(t, controller, canEdit, canApprove, readOnly),
      getInstanceColumn(t, controller, canManage, canAdd, readOnly),
      getRowActionsColumn(
        t,
        controller,
        containerId,
        t('editor.sheetBarcodeGridBlock.removeBarcodeConfirm'),
        canManage,
        canAdd,
        readOnly,
      ),
    ];

    setColumns(newColumns);
  }, [loroDoc, canManage, canAdd, canEdit, canApprove, t, containerId]);

  // Re-run updateColumns when permissions change
  useEffect(() => {
    updateColumns();
  }, [updateColumns]);

  const updateRows = useCallback(
    (barcodeGridRowLoroList: LoroMovableList<SheetBarcodeGridRowLoro>) => {
      const rows: BarcodeGridEditorTableRow[] = [];
      for (let i = 0; i < barcodeGridRowLoroList.length; i++) {
        const row = barcodeGridRowLoroList.get(i);
        rows.push({
          id: row.id,
          barcode: row.get('barcode'),
        });
      }
      setBarcodeRows(rows);
    },
    [],
  );

  const handleBarcodeAdd = useCallback(async () => {
    if (controller) {
      controller.addBarcodeToGridBlock(containerId);
      controller.commit();
    }
  }, [controller, containerId]);

  const handleCellClick = useCallback(
    (params: { row: BarcodeGridEditorTableRow; field: string }) => {
      setActiveCell({ rowId: params.row.id, field: params.field });
    },
    [],
  );

  const gridSx = useMemo(
    () => ({
      '--DataGrid-overlayHeight': '150px',
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
        blockContainerId: containerId,
        titleContainerId: titleContainerId,
        canAdd: canAdd,
        canManage: canManage,
        showOutlines: showTitleOutlines,
        handleBarcodeAdd: handleBarcodeAdd,
        readOnly: readOnly,
      },
    }),
    [
      containerId,
      titleContainerId,
      showTitleOutlines,
      canAdd,
      canManage,
      handleBarcodeAdd,
      readOnly,
    ],
  );

  const gridSlots = useMemo(
    () => ({
      toolbar: BarcodeGridEditorToolbar,
    }),
    [],
  );

  return (
    <>
      <DataGrid
        rows={barcodeRows}
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
        onCellClick={handleCellClick}
        sx={gridSx}
        slotProps={gridSlotProps}
        slots={gridSlots}
      />
    </>
  );
};

export default BarcodeGridEditorTable;
