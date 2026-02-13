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
import StatementLocalController from '../../controllers/StatementLocalController';

export type ManageSheetStatementElementPanelProps = {
  docController: StatementLocalController;
  blockId: ContainerID;
  langCode: string;
  readOnly?: boolean;
};

const ManageSheetStatementElementPanel = ({
  docController,
  blockId,
  langCode,
  readOnly,
}: ManageSheetStatementElementPanelProps) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const { language } = useContentLanguage(
    organization?.id || '',
    langCode,
    !!organization,
  );

  const sheetDocController = docController.getSheetController();

  const docAcls = sheetDocController.getDocAclMap();
  const blockAcls = sheetDocController.getBlockAclMap(blockId);
  const stmtAcls = docController.getStmtAclMap();
  const stmtElementAcls = docController.getStmtElementAclMap(langCode);

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
        canManage: sheetDocController.hasManageBlockPermission(blockId),
      },
      {
        name: 'statement',
        label: t('editor.permissionChainEditor.statementPermissions'),
        type: 'statement',
        acls: stmtAcls,
        canManage: docController.hasManagePermission(),
      },
      {
        name: 'element',
        label: t('editor.permissionChainEditor.localizationPermissions', {
          localization: language?.name || langCode,
        }),
        type: 'element',
        acls: stmtElementAcls,
        canManage: docController.hasManagePermission(),
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
    const unsubscribeDocAcl = docController.subscribeToDocAclChanges(() => {
      const updatedDocAcls = docController.getDocAclMap();
      setPermissionChain((prevChain) => {
        const newChain = { ...prevChain };
        newChain.chain[0].acls = updatedDocAcls;
        newChain.chain[0].canManage = docController.hasManagePermission();
        return newChain;
      });
    });

    const unsubscribeBlockAcl = sheetDocController.subscribeToBlockAclChanges(
      blockId,
      () => {
        // Subscribe to ACL changes on the element level
        const updatedBlockAcls = sheetDocController.getBlockAclMap(blockId);
        setPermissionChain((prevChain) => {
          const newChain = { ...prevChain };
          newChain.chain[1].acls = updatedBlockAcls;
          newChain.chain[1].canManage =
            sheetDocController.hasManageBlockPermission(blockId);
          return newChain;
        });
      },
    );

    const unsubscribeStatementAcl =
      docController.subscribeToStatementAclChanges(() => {
        const updatedStmtAcls = docController.getStmtAclMap();
        setPermissionChain((prevChain) => {
          const newChain = { ...prevChain };
          newChain.chain[2].acls = updatedStmtAcls;
          newChain.chain[2].canManage = docController.hasManagePermission();
          return newChain;
        });
      });

    const unsubscribeStatementElementAcl =
      docController.subscribeToStatementElementAclChanges(langCode, () => {
        const updatedStmtElementAcls =
          docController.getStmtElementAclMap(langCode);
        setPermissionChain((prevChain) => {
          const newChain = { ...prevChain };
          newChain.chain[3].acls = updatedStmtElementAcls;
          newChain.chain[3].canManage = docController.hasManagePermission();
          return newChain;
        });
      });

    return () => {
      unsubscribeDocAcl();
      unsubscribeBlockAcl();
      unsubscribeStatementAcl();
      unsubscribeStatementElementAcl();
    };
  }, [docController, sheetDocController, blockId]);

  const handlePermissionChainChange = useCallback(
    (newChain: PermissionChain) => {
      setPermissionChain(newChain);

      // Apply the acls from the permission chain.
      sheetDocController.patchDocAclMap(newChain.chain[0].acls);
      sheetDocController.patchBlockAclMap(blockId, newChain.chain[1].acls);
      docController.patchStatementAclMap(newChain.chain[2].acls);
      docController.patchStmtElementAclMap(langCode, newChain.chain[3].acls);
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

export default ManageSheetStatementElementPanel;
