import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import ManageStmtModal, {
  ManageStmtModalPayload,
} from '../ManageStmtModal/ManageStmtModal';
import { Permission } from '../../../ui/data/Permission';
import { StmtLoroDoc } from '../../data/ColabDoc';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import { Box } from '@mui/material';

export type ManageDocButtonProps = {
  onClick?: () => void;
};

const ManageDocButton: React.FC<ManageDocButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  const dialogs = useDialogs();

  const { colabDoc } = useColabDoc();
  const loroDoc = colabDoc?.getLoroDoc();

  /**
   * Handle the opening of the Manage Statement modal
   */
  const handleManageStatementClicked = async () => {
    // Ensure we have a colabDoc
    if (!colabDoc) {
      return;
    }

    // Open the ManageStmtModal dialog
    const newDocAclMaps = await dialogs.open<
      ManageStmtModalPayload,
      Record<Permission, string[]> | null
    >(ManageStmtModal, {
      loroDoc: loroDoc as StmtLoroDoc,
      docName: colabDoc?.getDocName() || '',
    });

    // If a new ACL map was returned, update the document
    if (newDocAclMaps) {
      // Create the StatementDocController
      const stmtDocController = colabDoc.getDocController();

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
      sx={{
        padding: '6px',
        height: '26px',
      }}
    >
      <Box
        sx={{
          minWidth: '100px',
          whiteSpace: 'nowrap',
          textWrap: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {t('editor.toolbar.manageDocument')}
      </Box>
    </Button>
  );
};

export default ManageDocButton;
