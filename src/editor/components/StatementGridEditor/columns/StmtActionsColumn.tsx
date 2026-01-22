import { TFunction } from 'i18next';
import LocalStmtDeleteAction from '../cells/LocalStmtDeleteAction/LocalStmtDeleteAction';
import { StatementGridEditorTableRow } from '../StatementGridEditorTable';
import { GridActionsColDef } from '@mui/x-data-grid';
import { ContainerID } from 'loro-crdt';

const getStmtActionsColumn = (
  t: TFunction,
  handleStatementRemove: (stmtRowContainerId: ContainerID) => Promise<void>,
): GridActionsColDef<StatementGridEditorTableRow> => ({
  field: 'actions',
  headerName: '',
  type: 'actions',
  align: 'left',
  width: 30,
  getActions: (data: { row: StatementGridEditorTableRow }) => [
    <LocalStmtDeleteAction
      row={data.row}
      onRemove={() => handleStatementRemove(data.row.id as ContainerID)}
    />,
  ],
});

export default getStmtActionsColumn;
