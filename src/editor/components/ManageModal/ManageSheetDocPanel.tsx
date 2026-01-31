import { Box, Button, Stack } from '@mui/material';
import PermissionChainEditor from '../PermissionChainEditor/PermissionChainEditor';
import SheetDocController from '../../controllers/SheetDocController';
import { PermissionChain } from '../PermissionChainEditor/PermissionChain';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../../ui/data/Permission';
import { useCallback, useEffect, useState } from 'react';

export type ManageSheetDocPanelProps = {
  docController: SheetDocController;
  readOnly?: boolean;
};

const ManageSheetDocPanel = ({
  docController,
  readOnly,
}: ManageSheetDocPanelProps) => {
  const { t } = useTranslation();

  const acls = docController.getDocAclMap();
  const canManage = docController.hasManagePermission();

  const initPermissionChain: PermissionChain = {
    chain: [
      {
        name: 'document',
        label: t('editor.permissionChainEditor.sheetPermissions'),
        type: 'doc',
        acls: acls,
        canManage: canManage,
      },
    ],
  };

  const [permissionChain, setPermissionChain] =
    useState<PermissionChain>(initPermissionChain);

  const availablePermissions = {
    [t('common.document')]: new Set([
      Permission.Manage,
      Permission.AddRemove,
      Permission.View,
    ]),
    [t('common.localization')]: new Set([Permission.Edit, Permission.Approve]),
  };

  // Subscribe to ACL changes
  useEffect(() => {
    // Subscribe to ACL changes on the document level
    const unsubscribeAcl = docController.subscribeToDocAclChanges(() => {
      const updatedAcls = docController.getDocAclMap();
      setPermissionChain((prevChain) => {
        const newChain = { ...prevChain };
        newChain.chain[0].acls = updatedAcls;
        newChain.chain[0].canManage = docController.hasManagePermission();
        return newChain;
      });
    });

    return () => {
      unsubscribeAcl();
    };
  }, [docController]);

  const handlePermissionChainChange = useCallback(
    (newChain: PermissionChain) => {
      setPermissionChain(newChain);

      // Apply the acls from the permission chain.
      docController.patchDocAclMap(newChain.chain[0].acls);
      docController.commit();
    },
    [docController],
  );

  return (
    <Stack spacing={2}>
      <PermissionChainEditor
        permissionChain={permissionChain}
        setPermissionChain={handlePermissionChainChange}
        availablePermissions={availablePermissions}
        defaultPermission={Permission.View}
        readOnly={readOnly}
      />
    </Stack>
  );
};

export default ManageSheetDocPanel;
