import { Stack, Tooltip } from '@mui/material';
import { ToolbarButton, ToolbarMenuDivider } from './ToolbarMenuStyles';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useEffect, useRef, useState } from 'react';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ColabSheetBlockType } from '../../../api/ColabriAPI';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import { useActiveBlock } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../../ui/data/Permission';
import ManagePermissionModal, {
  ManagePermissionModalPayload,
} from '../ManagePermissionModal/ManagePermissionModal';
import { ContainerID, LoroMap } from 'loro-crdt';
import { ConnectedSheetDoc } from '../../data/ConnectedColabDoc';
import AddBlockModal, {
  AddBlockModalPayload,
} from '../AddBlockModal/AddBlockModal';
import BlockAddIcon from '../icons/BlockAddIcon';
import BlockRemoveIcon from '../icons/BlockRemoveIcon';
import BlockSettingsIcon from '../icons/BlockSettingsIcon';

export type SheetMenuProps = {};

export default function SheetMenu({}: SheetMenuProps) {
  // Get the translation hook
  const { t } = useTranslation();

  // Get the document
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedSheetDoc)) {
    throw new Error('SheetMenu can only be used with connected sheet docs.');
  }

  // Get the current organization
  const organization = useOrganization();

  // Get the dialogs hook
  const dialogs = useDialogs();

  // Get the focussed block
  const activeBlock = useActiveBlock();
  // Check if a sheetBlock is focussed
  const isSheetBlockFocused =
    activeBlock?.blockType === 'StatementElementBlock' ||
    activeBlock?.blockType === 'SheetStatementGridBlock';

  // The refs to control menu state
  const showMenuRef = useRef<boolean>(false);
  const disabled = useRef<boolean>(true);

  // State to track whether the user can add/remove blocks or manage the block
  const [canAddRemove, setCanAddRemove] = useState<boolean>(false);
  const [canManage, setCanManage] = useState<boolean>(false);

  // Get the loroDoc
  const loroDoc = colabDoc.getLoroDoc();
  const controller = colabDoc.getDocController();

  // When the colabDoc is loaded.
  useEffect(() => {
    if (!colabDoc && !loroDoc) {
      return;
    }

    // Check the document type
    const type = loroDoc?.getMap('properties')?.get('type');
    if (type === 'colab-sheet') {
      // Enable the menu
      showMenuRef.current = true;
      disabled.current = false;
    }

    // Check permissions
    setCanAddRemove(controller.hasAddRemovePermission());
    setCanManage(controller.hasManagePermission());
    // Subscribe to ACL changes in the loroDoc
    controller.subscribeToDocAclChanges(() => {
      // On any ACL change, update the canEdit state
      setCanAddRemove(controller.hasAddRemovePermission());
      setCanManage(controller.hasManagePermission());
    });
  }, [colabDoc, controller, loroDoc]);

  /**
   * Get the focussed block
   * @returns
   */
  const getFocusedBlockContainerId = (): ContainerID | undefined => {
    // Make sure we have a focussed block
    if (!activeBlock || !activeBlock.loroContainerId || !activeBlock.loroDoc) {
      return;
    }

    // Figure out which block is focussed
    // Get the content map
    return activeBlock.loroContainerId;
  };

  /**
   * Handle the opening of the Manage Block modal
   */
  const handleManageSheetBlockClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Prevent default behavior
    e.preventDefault();

    // Get the focussed language
    const containerId = getFocusedBlockContainerId();
    if (!containerId || !controller) {
      return;
    }

    // Get the current ACLs
    const docAcls = controller.getDocAclMap();
    const sheetBlockAcls = controller.getBlockAclMap(containerId);

    // Open the modal to manage the block
    const newStmtElementAclMaps = await dialogs.open<
      ManagePermissionModalPayload,
      Record<Permission, string[]> | undefined
    >(ManagePermissionModal, {
      title: t('editor.managePermissionModal.blockTitle'),
      orgId: organization?.id || '',
      acls: sheetBlockAcls,
      docAcls: docAcls,
    });

    // If a new ACL map was returned, update the document
    if (newStmtElementAclMaps) {
      // Get the controller
      const sheetDocController = colabDoc.getDocController();

      // Patch the document ACL map with the new ACLs
      sheetDocController.patchBlockAclMap(containerId, newStmtElementAclMaps);

      // Commit the changes
      sheetDocController.commit();
    }
  };

  /**
   * Handle the Add Language button clicked
   */
  const handleAddBlockClicked = async () => {
    // Get the SheetDocController
    const sheetDocController = colabDoc.getDocController();

    // Figure out the position of where to add the block
    let position = -1;
    const containerId = getFocusedBlockContainerId();
    if (containerId) {
      position = sheetDocController.getContentListPosition(containerId);
    }

    // Show the modal
    const blockType = await dialogs.open<
      AddBlockModalPayload,
      ColabSheetBlockType | undefined
    >(AddBlockModal, {});

    // If no block type was selected, return
    if (!blockType) {
      return;
    }

    // Add a new block of the specified type
    sheetDocController.addBlock(blockType, position);

    // Commit the changes
    sheetDocController.commit();
  };

  /**
   * Handle the Remove Language button clicked
   * @param e
   * @returns
   */
  const handleRemoveBlockClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Prevent default behavior
    e.preventDefault();
    // Get the focussed block
    const containerId = getFocusedBlockContainerId();
    if (!containerId) {
      return;
    }

    // Ask for confirmation
    const confirm = await dialogs.confirm(
      t('editor.toolbar.removeBlockConfirm'),
    );

    // If not confirmed, return
    if (!confirm) {
      return;
    }

    // Get the SheetDocController
    const sheetDocController = colabDoc.getDocController();
    // Remove the block
    sheetDocController.removeBlock(containerId);
    sheetDocController.commit();
  };

  if (showMenuRef.current === false) {
    return <></>;
  } else {
    return (
      <Stack direction="row" spacing={'2px'}>
        {canAddRemove && (
          <>
            <ToolbarMenuDivider />
            <Tooltip title={t('editor.toolbar.addBlockTooltip')}>
              <span>
                <ToolbarButton
                  disabled={disabled.current}
                  onMouseDown={handleAddBlockClicked}
                >
                  <BlockAddIcon />
                </ToolbarButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.toolbar.removeBlockTooltip')}>
              <span>
                <ToolbarButton
                  disabled={disabled.current || !isSheetBlockFocused}
                  onMouseDown={handleRemoveBlockClicked}
                >
                  <BlockRemoveIcon />
                </ToolbarButton>
              </span>
            </Tooltip>
          </>
        )}

        {canManage && (
          <>
            <ToolbarMenuDivider />
            <Tooltip title={t('editor.toolbar.manageBlockTooltip')}>
              <span>
                <ToolbarButton
                  disabled={disabled.current || !isSheetBlockFocused}
                  onMouseDown={handleManageSheetBlockClicked}
                >
                  <BlockSettingsIcon />
                </ToolbarButton>
              </span>
            </Tooltip>
          </>
        )}
      </Stack>
    );
  }
}
