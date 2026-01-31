import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import { Box } from '@mui/material';
import { DocumentType } from '../../../api/ColabriAPI';
import {
  ManageSheetModalPayload,
  ManageStatementModalPayload,
} from '../ManageModal/ManageModalPayloads';
import ManageModal from '../ManageModal/ManageModal';
import StatementDocController from '../../controllers/StatementDocController';
import SheetDocController from '../../controllers/SheetDocController';

export type ManageDocButtonProps = {
  docType: DocumentType;
  onClick?: () => void;
  readOnly?: boolean;
};

const ManageDocButton: React.FC<ManageDocButtonProps> = ({
  docType,
  onClick,
  readOnly,
}) => {
  const { t } = useTranslation();
  const dialogs = useDialogs();

  const { colabDoc } = useColabDoc();

  /**
   * Handle the opening of the Manage Statement modal
   */
  const handleManageStatementClicked = async () => {
    // Ensure we have a colabDoc
    if (!colabDoc) {
      return;
    }

    let newDocAclMaps;
    if (docType === DocumentType.DocumentTypeColabStatement) {
      // Open the ManageStmtPermissionModal dialog
      await dialogs.open<ManageStatementModalPayload, void>(ManageModal, {
        type: 'statement',
        stmtDocController:
          colabDoc.getDocController() as StatementDocController,
        title: t('editor.toolbar.manageDocument'),
        readOnly: readOnly,
      });
    } else if (docType === DocumentType.DocumentTypeColabSheet) {
      // Open the ManageSheetPermissionModal dialog
      await dialogs.open<ManageSheetModalPayload, void>(ManageModal, {
        type: 'sheet',
        sheetDocController: colabDoc.getDocController() as SheetDocController,
        title: t('editor.toolbar.manageDocument'),
        readOnly: readOnly,
      });
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
