import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import ManageStmtModal, {
  ManageStmtModalPayload,
} from '../ManageStmtModal/ManageStmtModal';
import { Permission } from '../../../ui/data/Permission';
import { StmtLoroDoc } from '../../data/ColabDoc';
import StatementDocController from '../../data/StatementDocController';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';

export type ManageDocButtonProps = {
  onClick?: () => void;
};

const ManageDocButton: React.FC<ManageDocButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  const dialogs = useDialogs();

  const { colabDoc } = useColabDoc();
  const loroDoc = colabDoc?.loroDoc;

  /**
   * Handle the opening of the Manage Statement modal
   */
  const handleManageStatementClicked = async () => {
    const newDocAclMaps = await dialogs.open<
      ManageStmtModalPayload,
      Record<Permission, string[]> | null
    >(ManageStmtModal, {
      loroDoc: loroDoc as StmtLoroDoc,
      docName: colabDoc?.name || '',
    });

    // If a new ACL map was returned, update the document
    if (newDocAclMaps) {
      // Create the StatementDocController
      const stmtDocController = new StatementDocController(
        loroDoc as StmtLoroDoc,
      );

      // Patch the document ACL map with the new ACLs
      stmtDocController.patchDocAclMap(newDocAclMaps);

      // Commit the changes
      stmtDocController.commit();
    }

    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      size="small"
      variant="contained"
      onClick={handleManageStatementClicked}
    >
      {t('editor.toolbar.manageDocument')}
    </Button>
  );
};

export default ManageDocButton;
