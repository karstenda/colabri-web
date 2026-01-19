import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { Permission } from '../../../../ui/data/Permission';
import { useDialogs } from '../../../../ui/hooks/useDialogs/useDialogs';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc } from '../../../data/ConnectedColabDoc';
import ManagePermissionModal, {
  ManagePermissionModalPayload,
} from '../../ManagePermissionModal/ManagePermissionModal';
import DocEditorBlock, { DocEditorBlockProps } from './DocEditorBlock';

export type DocEditorSheetBlockProps = {
  foo?: string;
} & DocEditorBlockProps;

const DocEditorSheetBlock: React.FC<DocEditorSheetBlockProps> = (props) => {
  const { foo, ...docEditorBlockProps } = props;

  // Get the dialogs hook
  const dialogs = useDialogs();
  const organization = useOrganization();
  const { t } = useTranslation();

  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedSheetDoc)) {
    throw new Error(
      'SheetTextBlock can only be used with connected sheet docs.',
    );
  }

  // Get the LoroDoc
  const loroDoc = colabDoc?.getLoroDoc();

  // Get the controller
  const controller = colabDoc?.getDocController();

  /**
   * Manage the selected block's permissions
   *
   * @returns
   */
  const handleManageBlock = async () => {
    if (!controller) {
      return;
    }

    // Get the current ACLs
    const docAcls = controller.getDocAclMap();
    const blockAcls = controller.getBlockAclMap(
      docEditorBlockProps.loroContainerId,
    );

    // Open the modal to manage the statement element
    const newAclMaps = await dialogs.open<
      ManagePermissionModalPayload,
      Record<Permission, string[]> | undefined
    >(ManagePermissionModal, {
      title: t('editor.managePermissionModal.blockTitle'),
      orgId: organization?.id || '',
      acls: blockAcls,
      docAcls: docAcls,
      availablePermissions: new Set<Permission>([
        Permission.Edit,
        Permission.Approve,
        Permission.Manage,
      ]),
      defaultPermission: Permission.Edit,
    });

    // If a new ACL map was returned, update the document
    if (newAclMaps) {
      // Patch the document ACL map with the new ACLs
      controller.patchBlockAclMap(
        docEditorBlockProps.loroContainerId,
        newAclMaps,
      );

      // Commit the changes
      controller.commit();
    }
  };

  /**
   * Shift the block up or down
   *
   * @param direction
   * @returns
   */
  const handleShift = (direction: 'up' | 'down') => {
    if (!controller) {
      return;
    }
    // Shift the block
    const success = controller.shiftBlock(
      docEditorBlockProps.loroContainerId,
      direction,
    );
    if (success) {
      controller.commit();
    }
  };

  return (
    <DocEditorBlock
      {...docEditorBlockProps}
      showUpDownControls={true}
      onManageBlock={
        docEditorBlockProps.onManageBlock
          ? docEditorBlockProps.onManageBlock
          : handleManageBlock
      }
      onMoveUp={() => handleShift('up')}
      onMoveDown={() => handleShift('down')}
    />
  );
};

export default DocEditorSheetBlock;
