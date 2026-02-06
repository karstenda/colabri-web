import { TFunction } from 'i18next';
import { StatementGridEditorTableRow } from '../StatementGridEditorTable';
import { StatementGridRowType } from '../../../../api/ColabriAPI';
import LocalStmtElementCell from '../cells/StmtElementCell/LocalStmtElementCell';
import RefStmtElementCell from '../cells/StmtElementCell/RefStmtElementCell';
import { ContentLanguage } from '../../../data/ContentLanguage';

const getStmtEditColumn = (language: ContentLanguage, t: TFunction) => ({
  field: 'lang-' + language.code,
  headerName: language.name,
  width: 250,
  minWidth: 250,
  sortable: false,
  filterable: false,
  renderCell: (data: { row: StatementGridEditorTableRow }) => {
    const row = data.row as StatementGridEditorTableRow;

    if (row.type == StatementGridRowType.StatementGridRowTypeLocal) {
      if (!row.statement) {
        return <>{t('editor.sheetStatementGridBlock.noStatement')}</>;
      } else {
        return (
          <LocalStmtElementCell
            langCode={language.code}
            statement={row.statement}
            field={'lang-' + language.code}
            rowId={row.id}
          />
        );
      }
    } else {
      return (
        <RefStmtElementCell
          langCode={language.code}
          field={'lang-' + language.code}
          rowId={row.id}
        />
      );
    }
  },
});

export default getStmtEditColumn;
