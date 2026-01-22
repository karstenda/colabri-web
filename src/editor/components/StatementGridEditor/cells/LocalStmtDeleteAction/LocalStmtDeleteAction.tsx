import { GridActionsCellItem } from '@mui/x-data-grid/components';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import { StatementGridEditorTableRow } from '../../StatementGridEditorTable';

export type LocalStmtDeleteActionProps = {
  row: StatementGridEditorTableRow;
  onRemove: () => Promise<void>;
};

const LocalStmtDeleteAction = (props: LocalStmtDeleteActionProps) => {
  const { t } = useTranslation();

  return (
    <GridActionsCellItem
      key="delete-item"
      icon={<DeleteIcon />}
      label={t('common.delete')}
      onClick={props.onRemove}
    />
  );
};

export default LocalStmtDeleteAction;
