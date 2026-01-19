import { TFunction } from 'i18next';
import LocalNameCell from '../cells/LocalNameCell';
import { StatementGridEditorRow } from '../StatementGridEditor';
import { StatementGridRowType } from '../../../../../api/ColabriAPI';
import CellWrapper from '../cells/CellWrapper';

const getStmtNameColumn = (t: TFunction) => ({
  field: 'name',
  headerName: t('statements.columns.name'),
  width: 200,
  renderCell: (data: { row: StatementGridEditorRow }) => {
    const row = data.row as StatementGridEditorRow;

    if (row.type == StatementGridRowType.StatementGridRowTypeLocal) {
      if (!row.statement) {
        return <>{t('editor.sheetStatementGridBlock.noStatement')}</>;
      } else {
        return <LocalNameCell statement={row.statement} />;
      }
    } else {
      return <CellWrapper>Remote</CellWrapper>;
    }
  },
});

export default getStmtNameColumn;
