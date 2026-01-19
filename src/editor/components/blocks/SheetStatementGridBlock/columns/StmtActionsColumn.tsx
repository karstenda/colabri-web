import { TFunction } from 'i18next';
import LocalStmtDeleteAction from '../cells/LocalStmtDeleteAction';
import { StatementGridEditorRow } from '../StatementGridEditor';
import { GridActionsColDef } from '@mui/x-data-grid';
import { ContainerID } from 'loro-crdt';

const getStmtActionsColumn = (
  t: TFunction,
  handleStatementRemove: (stmtRowContainerId: ContainerID) => Promise<void>,
): GridActionsColDef<StatementGridEditorRow> => ({
  field: 'actions',
  headerName: '',
  type: 'actions',
  align: 'left',
  width: 30,
  getActions: (data: { row: StatementGridEditorRow }) => [
    <LocalStmtDeleteAction
      row={data.row}
      onRemove={() => handleStatementRemove(data.row.id as ContainerID)}
    />,
  ],
});

export default getStmtActionsColumn;
