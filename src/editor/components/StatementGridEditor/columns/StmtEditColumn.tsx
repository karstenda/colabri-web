import { TFunction } from 'i18next';
import { StatementGridEditorTableRow } from '../StatementGridEditorTable';
import { StatementGridRowType } from '../../../../api/ColabriAPI';
import LocalStmtEditCell from '../cells/LocalStmtElementCell/LocalStmtElementCell';
import { ContentLanguage } from '../../../data/ContentLanguage';
import { JSX } from 'react';

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
          <LocalStmtEditCell
            langCode={language.code}
            statement={row.statement}
            field={'lang-' + language.code}
            rowId={row.id}
          />
        );
      }
    } else {
      return <>Remote</>;
    }
  },
});

export default getStmtEditColumn;
