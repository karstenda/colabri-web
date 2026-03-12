import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import PermissionChainEditor from '../PermissionChainEditor/PermissionChainEditor';
import SheetDocController from '../../controllers/SheetDocController';
import { PermissionChain } from '../PermissionChainEditor/PermissionChain';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../../ui/data/Permission';
import { useCallback, useEffect, useState } from 'react';
import { useContentLanguage } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ContainerID } from 'loro-crdt';
import { ColabSheetBlockTitleType } from '../../../api/ColabriAPI';

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

  const [selectedTab, setSelectedTab] = useState(0);

  const [titleType, setTitleType] = useState<ColabSheetBlockTitleType>(
    docController.getBlockTitleType(blockId),
  );

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

  const availablePermissions = new Set([
    Permission.Manage,
    Permission.AddRemove,
    Permission.Edit,
    Permission.Approve,
  ]);

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
    // Subscribe to ACL changes on the block level
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
    // Subscribe to block property changes
    const unsubscribeBlockPropertyChange =
      docController.subscribeToFieldChanges(blockId, 'titleType', () => {
        // Handle block property changes here
        setTitleType(docController.getBlockTitleType(blockId));
      });

    return () => {
      unsubscribeAcl();
      unsubscribeBlockAcl();
      unsubscribeBlockPropertyChange();
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

  const handleTitleTypeChange = useCallback(
    (event: SelectChangeEvent) => {
      const newTitleType = event.target.value as ColabSheetBlockTitleType;
      setTitleType(newTitleType);
      docController.setBlockTitleType(blockId, newTitleType);
      docController.commit();
    },
    [docController, blockId],
  );

  return (
    <Box
      sx={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 2 }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: (theme) => (theme.vars || theme).palette.grey[600],
          marginTop: '-20px',
        }}
      >
        <Tabs
          variant="scrollable"
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          aria-label="Block Sheet Management"
          sx={{ borderRight: 1, borderColor: 'divider' }}
        >
          <Tab label={t('common.permissions')} id="permissions" />
          <Tab label={t('common.properties')} id="properties" />
        </Tabs>
      </Box>
      <Box sx={{}}>
        {selectedTab === 0 && (
          <Stack spacing={2}>
            <PermissionChainEditor
              permissionChain={permissionChain}
              setPermissionChain={handlePermissionChainChange}
              availablePermissions={availablePermissions}
              defaultPermission={Permission.Edit}
              readOnly={readOnly}
            />
          </Stack>
        )}
        {selectedTab === 1 && (
          <Box sx={{ p: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="block-title-type-label">
                {t('editor.sheetBlockManage.titleHeading')}
              </InputLabel>
              <Select
                labelId="block-title-type-label"
                fullWidth
                value={titleType}
                onChange={handleTitleTypeChange}
              >
                <MenuItem
                  value={ColabSheetBlockTitleType.ColabSheetBlockTitleLevelNone}
                >
                  {t('editor.sheetBlockManage.noHeading')}
                </MenuItem>
                <MenuItem
                  value={ColabSheetBlockTitleType.ColabSheetBlockTitleLevel1}
                >
                  {t('editor.sheetBlockManage.heading1')}
                </MenuItem>
                <MenuItem
                  value={ColabSheetBlockTitleType.ColabSheetBlockTitleLevel2}
                >
                  {t('editor.sheetBlockManage.heading2')}
                </MenuItem>
                <MenuItem
                  value={ColabSheetBlockTitleType.ColabSheetBlockTitleLevel3}
                >
                  {t('editor.sheetBlockManage.heading3')}
                </MenuItem>
                <MenuItem
                  value={ColabSheetBlockTitleType.ColabSheetBlockTitleLevel4}
                >
                  {t('editor.sheetBlockManage.heading4')}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ManageSheetBlockPanel;
