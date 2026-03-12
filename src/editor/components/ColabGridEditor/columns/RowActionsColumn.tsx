import { TFunction } from 'i18next';
import { ColabGridEditorTableRow } from '../data/ColabGridEditorTableRow';
import { GridActionsColDef } from '@mui/x-data-grid';
import { ContainerID } from 'loro-crdt';
import SheetDocController from '../../../controllers/SheetDocController';
import RowDeleteAction from '../cells/DeleteAction/DeleteAction';

const getRowActionsColumn = (
  t: TFunction,
  controller: SheetDocController,
  blockId: ContainerID,
  deleteConfirmationMessage: string,
  canManage: boolean,
  canAdd: boolean,
  readOnly?: boolean,
): GridActionsColDef<ColabGridEditorTableRow> => ({
  field: 'actions',
  headerName: '',
  type: 'actions',
  align: 'center',
  width: 28,
  getActions: (data: { row: ColabGridEditorTableRow }) => {
    const actions = [];

    // Show delete action only if canManage or canAdd
    if ((canManage || canAdd) && !readOnly) {
      actions.push(
        <RowDeleteAction
          row={data.row}
          controller={controller}
          blockId={blockId}
          confirmationMessage={deleteConfirmationMessage}
        />,
      );
    }

    return actions;
  },
});

export default getRowActionsColumn;
