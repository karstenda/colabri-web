import { Box, Button, Stack } from '@mui/material';
import PermissionChainEditor from '../PermissionChainEditor/PermissionChainEditor';
import SheetDocController from '../../controllers/SheetDocController';
import { PermissionChain } from '../PermissionChainEditor/PermissionChain';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../../ui/data/Permission';
import { useCallback, useEffect, useState } from 'react';
import { useContentLanguage } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ContainerID } from 'loro-crdt';

export type ManageSheetBlockPanelProps = {
  docController: SheetDocController;
  blockId: ContainerID;
  readOnly?: boolean;
};

const ManageSheetBlockPanel = ({
  docController,
  blockId,
  readOnly,
}: ManageSheetBlockPanelProps) => {
  const { t } = useTranslation();

  const docAcls = docController.getDocAclMap();
  const blockAcls = docController.getBlockAclMap(blockId);

  const initPermissionChain: PermissionChain = {
    chain: [
      {
        name: 'doc',
        label: t('editor.permissionChainEditor.sheetPermissions'),
        type: 'doc',
        acls: docAcls,
        canManage: docController.hasManagePermission(),
      },
      {
        name: 'block',
        label: t('editor.permissionChainEditor.blockPermissions'),
        type: 'block',
        acls: blockAcls,
        canManage: docController.hasManageBlockPermission(blockId),
      },
    ],
  };

  const [permissionChain, setPermissionChain] =
    useState<PermissionChain>(initPermissionChain);

  const availablePermissions = {
    [t('common.block')]: new Set([Permission.Manage, Permission.AddRemove]),
    [t('common.localization')]: new Set([Permission.Edit, Permission.Approve]),
  };

  // Subscribe to ACL changes
  useEffect(() => {
    // Subscribe to ACL changes on the document level
    const unsubscribeAcl = docController.subscribeToDocAclChanges(() => {
      const updatedDocAcls = docController.getDocAclMap();
      setPermissionChain((prevChain) => {
        const newChain = { ...prevChain };
        newChain.chain[0].acls = updatedDocAcls;
        newChain.chain[0].canManage = docController.hasManagePermission();
        return newChain;
      });
    });

    const unsubscribeBlockAcl = docController.subscribeToBlockAclChanges(
      blockId,
      () => {
        // Subscribe to ACL changes on the element level
        const updatedBlockAcls = docController.getBlockAclMap(blockId);
        setPermissionChain((prevChain) => {
          const newChain = { ...prevChain };
          newChain.chain[1].acls = updatedBlockAcls;
          newChain.chain[1].canManage =
            docController.hasManageBlockPermission(blockId);
          return newChain;
        });
      },
    );

    return () => {
      unsubscribeAcl();
      unsubscribeBlockAcl();
    };
  }, [docController, blockId]);

  const handlePermissionChainChange = useCallback(
    (newChain: PermissionChain) => {
      setPermissionChain(newChain);

      // Apply the acls from the permission chain.
      docController.patchDocAclMap(newChain.chain[0].acls);
      docController.patchBlockAclMap(blockId, newChain.chain[1].acls);
      docController.commit();
    },
    [docController, blockId],
  );

  return (
    <Stack spacing={2}>
      <PermissionChainEditor
        permissionChain={permissionChain}
        setPermissionChain={handlePermissionChainChange}
        availablePermissions={availablePermissions}
        defaultPermission={Permission.Edit}
        readOnly={readOnly}
      />
    </Stack>
  );
};

export default ManageSheetBlockPanel;
