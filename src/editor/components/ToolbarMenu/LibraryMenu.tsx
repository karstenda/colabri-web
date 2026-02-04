import Button from '@mui/material/Button';
import {
  useIsCloudAdmin,
  useIsOrgAdmin,
} from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useTranslation } from 'react-i18next';
import { ToolbarButton, ToolbarMenuDivider } from './ToolbarMenuStyles';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import {
  MoveLibraryModal,
  MoveLibraryModalPayload,
} from '../MoveLibraryModal/MoveLibraryModal';
import Stack from '@mui/material/Stack';

export type LibraryMenuProps = {};

const LibraryMenu = ({}: LibraryMenuProps) => {
  // The main active document
  const { colabDoc } = useColabDoc();
  const { t } = useTranslation();
  const dialogs = useDialogs();

  // Get the document controller
  const controller = colabDoc?.getDocController();

  // Check if the document is fully approved
  const isFullyApproved = controller?.isFullyApproved();

  // Check if we're the owner, an org admin, or cloud admin
  const isOwner = controller?.isOwner();
  const isOrgAdmin = useIsOrgAdmin();
  const isCloudAdmin = useIsCloudAdmin();

  const enabled = isFullyApproved && (isOwner || isOrgAdmin || isCloudAdmin);

  const handleLibraryMove = async () => {
    if (!colabDoc) {
      return;
    }
    // Show the modal
    await dialogs.open<MoveLibraryModalPayload, void>(MoveLibraryModal, {
      doc: colabDoc,
    });
  };

  return (
    <Stack direction="row" spacing={'2px'} sx={{ alignItems: 'center' }}>
      <ToolbarMenuDivider />
      <ToolbarButton disabled={!enabled} onClick={handleLibraryMove}>
        {t('libraries.moveToLibrary')}
      </ToolbarButton>
    </Stack>
  );
};

export default LibraryMenu;
