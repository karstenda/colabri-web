import { Box, Button, Stack } from '@mui/material';
import PermissionChainEditor from '../PermissionChainEditor/PermissionChainEditor';
import StatementDocController from '../../controllers/StatementDocController';
import { PermissionChain } from '../PermissionChainEditor/PermissionChain';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../../ui/data/Permission';
import { useCallback, useEffect, useState } from 'react';
import { useContentLanguage } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';

export type ManageStatementElementPanelProps = {
  docController: StatementDocController;
  langCode: string;
  readOnly?: boolean;
};

const ManageStatementElementPanel = ({
  docController,
  langCode,
  readOnly,
}: ManageStatementElementPanelProps) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const { language } = useContentLanguage(
    organization?.id || '',
    langCode,
    !!organization,
  );

  const docAcls = docController.getDocAclMap();
  const elementAcls = docController.getStmtElementAclMap(langCode);
  const canManage = docController.hasManagePermission();

  const initPermissionChain: PermissionChain = {
    chain: [
      {
        name: 'doc',
        label: t('editor.permissionChainEditor.statementPermissions'),
        type: 'doc',
        acls: docAcls,
        canManage: canManage,
      },
      {
        name: 'element',
        label: t('editor.permissionChainEditor.localizationPermissions', {
          localization: language?.name || langCode,
        }),
        type: 'element',
        acls: elementAcls,
        canManage: canManage,
      },
    ],
  };

  const [permissionChain, setPermissionChain] =
    useState<PermissionChain>(initPermissionChain);

  const availablePermissions = {
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

    const unsubscribeElementAcl =
      docController.subscribeToStatementElementAclChanges(langCode, () => {
        // Subscribe to ACL changes on the element level
        const updatedElementAcls = docController.getStmtElementAclMap(langCode);
        setPermissionChain((prevChain) => {
          const newChain = { ...prevChain };
          newChain.chain[1].acls = updatedElementAcls;
          newChain.chain[1].canManage = docController.hasManagePermission();
          return newChain;
        });
      });

    return () => {
      unsubscribeAcl();
      unsubscribeElementAcl();
    };
  }, [docController, langCode]);

  const handlePermissionChainChange = useCallback(
    (newChain: PermissionChain) => {
      setPermissionChain(newChain);

      // Apply the acls from the permission chain.
      docController.patchDocAclMap(newChain.chain[0].acls);
      docController.patchStmtElementAclMap(langCode, newChain.chain[1].acls);
      docController.commit();
    },
    [docController, langCode],
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

export default ManageStatementElementPanel;
