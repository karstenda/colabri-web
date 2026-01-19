import { TFunction } from 'i18next';
import { StatementGridEditorRow } from '../StatementGridEditor';
import { StatementGridRowType } from '../../../../../api/ColabriAPI';
import LocalStmtLangCell from '../cells/LocalStmtLangCell';
import { ContentLanguage } from '../../../../data/ContentLanguage';
import { JSX } from 'react';

const getStmtLangColumn = (language: ContentLanguage, t: TFunction) => ({
  field: 'lang-' + language.code,
  headerName: language.name,
  width: 250,
  minWidth: 250,
  renderCell: (data: { row: StatementGridEditorRow }): JSX.Element => {
    const row = data.row as StatementGridEditorRow;

    if (row.type == StatementGridRowType.StatementGridRowTypeLocal) {
      if (!row.statement) {
        return <>{t('editor.sheetStatementGridBlock.noStatement')}</>;
      } else {
        return (
          <LocalStmtLangCell
            langCode={language.code}
            statement={row.statement}
          />
        );
      }
    } else {
      return <>Remote</>;
    }
  },
});

export default getStmtLangColumn;
