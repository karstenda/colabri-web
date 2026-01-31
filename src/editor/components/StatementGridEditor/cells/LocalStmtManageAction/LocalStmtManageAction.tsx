import { GridActionsCellItem } from '@mui/x-data-grid/components';
import { useTranslation } from 'react-i18next';
import SettingsIcon from '@mui/icons-material/Settings';
import { StatementGridEditorTableRow } from '../../StatementGridEditorTable';
import { useDialogs } from '../../../../../ui/hooks/useDialogs/useDialogs';
import {
  ManageSheetStatementModalPayload,
  ManageStatementModalPayload,
} from '../../../ManageModal/ManageModalPayloads';
import ManageModal from '../../../ManageModal/ManageModal';
import SheetDocController from '../../../../controllers/SheetDocController';
import { ContainerID } from 'loro-crdt';
import { useCallback } from 'react';

export type LocalStmtDeleteActionProps = {
  row: StatementGridEditorTableRow;
  controller: SheetDocController;
  blockId: ContainerID;
};

const LocalStmtManageAction = ({
  row,
  controller,
  blockId,
}: LocalStmtDeleteActionProps) => {
  const { t } = useTranslation();
  const dialogs = useDialogs();

  const handleManage = useCallback(
    async (stmtRowContainerId: ContainerID) => {
      // Figure out which statement is actually selected
      const stmtContainerId =
        controller.getLocalStmtContainerId(stmtRowContainerId);
      const stmtDocController =
        controller.getLocalStatementController(stmtContainerId);

      // Open the manage modal for the statement
      await dialogs.open<ManageSheetStatementModalPayload, void>(ManageModal, {
        type: 'sheet-statement',
        title: t('editor.manageModal.statementTitle'),
        stmtDocController: stmtDocController,
        blockContainerId: blockId,
      });
    },
    [controller, dialogs, t, blockId],
  );

  return (
    <GridActionsCellItem
      key="manage-item"
      icon={<SettingsIcon />}
      label={t('common.manage')}
      onClick={() => handleManage(row.id as ContainerID)}
    />
  );
};

export default LocalStmtManageAction;
