import { GridActionsCellItem } from '@mui/x-data-grid/components';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import { StatementGridEditorTableRow } from '../../StatementGridEditorTable';
import { useCallback } from 'react';
import { ContainerID } from 'loro-crdt';
import { useDialogs } from '../../../../../ui/hooks/useDialogs/useDialogs';
import SheetDocController from '../../../../controllers/SheetDocController';

export type LocalStmtDeleteActionProps = {
  row: StatementGridEditorTableRow;
  controller: SheetDocController;
  blockId: ContainerID;
};

const LocalStmtDeleteAction = ({
  row,
  controller,
  blockId,
}: LocalStmtDeleteActionProps) => {
  const { t } = useTranslation();
  const dialogs = useDialogs();

  const handleStatementRemove = useCallback(
    async (stmtRowContainerId: ContainerID) => {
      // Confirm the deletion of the statement
      const confirm = await dialogs.confirm(
        t('editor.sheetStatementGridBlock.removeStatementConfirm'),
      );

      if (confirm && controller) {
        // Add the new statement via the controller
        const ok = controller.removeStatementFromStatementGridBlock(
          blockId,
          stmtRowContainerId,
        );
        if (ok) {
          controller.commit();
        }
      }
    },
    [controller, blockId, dialogs],
  );

  return (
    <GridActionsCellItem
      key="delete-item"
      icon={<DeleteIcon />}
      label={t('common.delete')}
      onClick={() => handleStatementRemove(row.id as ContainerID)}
    />
  );
};

export default LocalStmtDeleteAction;
