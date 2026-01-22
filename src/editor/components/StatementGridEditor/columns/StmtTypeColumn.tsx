import { TFunction } from 'i18next';
import LocalTypeCell from '../cells/LocalTypeCell/LocalTypeCell';
import { StatementGridEditorTableRow } from '../StatementGridEditorTable';
import { StatementGridRowType } from '../../../../api/ColabriAPI';
import CellWrapper from '../cells/CellWrapper';

const getStmtTypeColumn = (t: TFunction) => ({
  field: 'name',
  headerName: t('statements.columns.name'),
  width: 200,
  hideable: false,
  renderCell: (data: {
    row: StatementGridEditorTableRow;
    hasFocus: boolean;
  }) => {
    const row = data.row as StatementGridEditorTableRow;
    const hasFocus = data.hasFocus;

    if (row.type == StatementGridRowType.StatementGridRowTypeLocal) {
      if (!row.statement) {
        return <>{t('editor.sheetStatementGridBlock.noStatement')}</>;
      } else {
        return <LocalTypeCell statement={row.statement} hasFocus={hasFocus} />;
      }
    } else {
      return <CellWrapper>Remote</CellWrapper>;
    }
  },
});

export default getStmtTypeColumn;
