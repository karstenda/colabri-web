import { TFunction } from 'i18next';
import { StatementGridEditorTableRow } from '../StatementGridEditorTable';
import { GridActionsColDef } from '@mui/x-data-grid';
import { ContainerID } from 'loro-crdt';
import LocalStmtManageAction from '../cells/LocalStmtManageAction/LocalStmtManageAction';
import SheetDocController from '../../../controllers/SheetDocController';
import RowDeleteAction from '../../ColabGridEditor/cells/DeleteAction/DeleteAction';

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
  align: 'center',
  width: 74,
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
        <RowDeleteAction
          row={data.row}
          controller={controller}
          blockId={blockId}
          confirmationMessage={t(
            'editor.sheetStatementGridBlock.removeStatementConfirm',
          )}
        />,
      );
    }

    return actions;
  },
});

export default getStmtActionsColumn;
