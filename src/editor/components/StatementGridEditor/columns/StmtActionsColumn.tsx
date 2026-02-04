import { TFunction } from 'i18next';
import LocalStmtDeleteAction from '../cells/LocalStmtDeleteAction/LocalStmtDeleteAction';
import { StatementGridEditorTableRow } from '../StatementGridEditorTable';
import { GridActionsColDef } from '@mui/x-data-grid';
import { ContainerID } from 'loro-crdt';
import LocalStmtManageAction from '../cells/LocalStmtManageAction/LocalStmtManageAction';
import SheetDocController from '../../../controllers/SheetDocController';

const getStmtActionsColumn = (
  t: TFunction,
  controller: SheetDocController,
  blockId: ContainerID,
  canManage?: boolean,
  canAdd?: boolean,
  readOnly?: boolean,
): GridActionsColDef<StatementGridEditorTableRow> => ({
  field: 'actions',
  headerName: '',
  type: 'actions',
  align: 'left',
  getActions: (data: { row: StatementGridEditorTableRow }) => {
    const actions = [];

    // Show manage action only if canManage
    if (canManage) {
      actions.push(
        <LocalStmtManageAction
          row={data.row}
          controller={controller}
          blockId={blockId}
        />,
      );
    }

    // Show delete action only if canManage or canAdd
    if ((canManage || canAdd) && !readOnly) {
      actions.push(
        <LocalStmtDeleteAction
          row={data.row}
          controller={controller}
          blockId={blockId}
        />,
      );
    }

    return actions;
  },
});

export default getStmtActionsColumn;
