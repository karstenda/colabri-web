import { Box, Button, Stack } from '@mui/material';
import PermissionChainEditor from '../PermissionChainEditor/PermissionChainEditor';
import StatementDocController from '../../controllers/StatementDocController';
import { PermissionChain } from '../PermissionChainEditor/PermissionChain';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../../ui/data/Permission';
import { useCallback, useEffect, useState } from 'react';

export type ManageStatementDocPanelProps = {
  docController: StatementDocController;
  readOnly?: boolean;
};

const ManageStatementDocPanel = ({
  docController,
  readOnly,
}: ManageStatementDocPanelProps) => {
  const { t } = useTranslation();

  const acls = docController.getDocAclMap();
  const canManage = docController.hasManagePermission();

  const initPermissionChain: PermissionChain = {
    chain: [
      {
        name: 'document',
        label: t('editor.permissionChainEditor.statementPermissions'),
        type: 'doc',
        acls: acls,
        canManage: canManage,
      },
    ],
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

export default ManageStatementDocPanel;
