import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import ColabTextEditor from '../../../ColabTextEditor/ColabTextEditor';
import { ConnectedSheetDoc } from '../../../../data/ConnectedColabDoc';
import { LoroDocType } from 'loro-prosemirror';
import { useColabDoc } from '../../../../context/ColabDocContext/ColabDocProvider';
import { GridActionsCellItem } from '@mui/x-data-grid/components';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import { StatementGridEditorRow } from '../StatementGridEditor';

export type LocalStmtDeleteActionProps = {
  row: StatementGridEditorRow;
};

const LocalStmtDeleteAction = (props: LocalStmtDeleteActionProps) => {
  const { t } = useTranslation();

  const handleRowDelete = (row: StatementGridEditorRow) => () => {
    // Implement the delete logic here
    console.log(`Delete row with id: ${row.id}`);
  };

  return (
    <GridActionsCellItem
      key="delete-item"
      icon={<DeleteIcon />}
      label={t('common.delete')}
      onClick={handleRowDelete(props.row)}
    />
  );
};

export default LocalStmtDeleteAction;
