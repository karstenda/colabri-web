import { TFunction } from 'i18next';
import { StatementGridEditorRow } from '../StatementGridEditor';
import { StatementGridRowType } from '../../../../../api/ColabriAPI';
import LocalStmtLangCell from '../cells/LocalStmtLangCell';

const getStmtLangColumn = (
  langCode: string,
  langLabel: string,
  t: TFunction,
) => ({
  field: 'lang-' + langCode,
  headerName: langLabel,
  width: 250,
  flex: 1,
  renderCell: (data: { row: StatementGridEditorRow }) => {
    const row = data.row as StatementGridEditorRow;

    if (row.type == StatementGridRowType.StatementGridRowTypeLocal) {
      return <LocalStmtLangCell langCode={langCode} />;
    } else {
      return <>Remote</>;
    }
  },
});

export default getStmtLangColumn;
