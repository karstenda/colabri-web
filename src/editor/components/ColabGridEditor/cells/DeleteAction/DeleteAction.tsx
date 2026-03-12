import { GridActionsCellItem } from '@mui/x-data-grid/components';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import { ColabGridEditorTableRow } from '../../data/ColabGridEditorTableRow';
import { useCallback } from 'react';
import { ContainerID } from 'loro-crdt';
import { useDialogs } from '../../../../../ui/hooks/useDialogs/useDialogs';
import SheetDocController from '../../../../controllers/SheetDocController';

export type RowDeleteActionProps = {
  row: ColabGridEditorTableRow;
  controller: SheetDocController;
  blockId: ContainerID;
  confirmationMessage: string;
};

const RowDeleteAction = ({
  row,
  controller,
  blockId,
  confirmationMessage,
}: RowDeleteActionProps) => {
  const { t } = useTranslation();
  const dialogs = useDialogs();

  const handleRowRemove = useCallback(
    async (rowContainerId: ContainerID) => {
      // Confirm the deletion of the row
      const confirm = await dialogs.confirm(confirmationMessage);

      if (confirm && controller) {
        // Add the new statement via the controller
        const ok = controller.removeRowFromBlock(blockId, rowContainerId);
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
      onClick={() => handleRowRemove(row.id as ContainerID)}
    />
  );
};

export default RowDeleteAction;
