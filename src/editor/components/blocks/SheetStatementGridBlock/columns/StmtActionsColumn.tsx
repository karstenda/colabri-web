import { TFunction } from 'i18next';
import LocalStmtDeleteAction from '../cells/LocalStmtDeleteAction';
import { StatementGridEditorRow } from '../StatementGridEditor';
import { GridActionsColDef } from '@mui/x-data-grid';

const getStmtActionsColumn = (
  t: TFunction,
): GridActionsColDef<StatementGridEditorRow> => ({
  field: 'actions',
  headerName: '',
  type: 'actions',
  align: 'left',
  width: 30,
  getActions: (data: { row: StatementGridEditorRow }) => [
    <LocalStmtDeleteAction row={data.row} />,
  ],
});

export default getStmtActionsColumn;
