import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import type { OrgContentLanguage } from '../../../api/ColabriAPI';
import PermissionEditor from '../../../ui/components/PermissionEditor/PermissionEditor';
import { StmtLoroDoc } from '../../data/ColabDoc';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { Permission } from '../../../ui/data/Permission';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ManageStmtLangModalPayload = {
  contentLanguage: OrgContentLanguage;
  loroDoc: StmtLoroDoc;
};

export interface ManageStmtLangModalProps
  extends DialogProps<
    ManageStmtLangModalPayload,
    Record<Permission, string[]> | undefined
  > {}

const ManageStmtLangModal = ({
  open,
  payload,
  onClose,
}: ManageStmtLangModalProps) => {
  // Extract the payload
  const { contentLanguage, loroDoc } = payload;

  const { t } = useTranslation();

  // Extract the aclMap from the loroDoc
  const docAclMap = loroDoc.getMap('acl');
  let fixedAcls;
  if (!docAclMap) {
    fixedAcls = {};
  } else {
    fixedAcls = docAclMap.toJSON();
  }

  // Extract the aclMap from this element
  const aclMap = loroDoc
    .getMap('content')
    ?.get(contentLanguage.code)
    ?.get('acl');
  let acls;
  if (!aclMap) {
    acls = {};
  } else {
    acls = aclMap.toJSON();
  }

  // Remember the new acls in the state
  const [newAcls, setNewAcls] = useState<Record<Permission, string[]>>(acls);

  const handleCancel = async () => {
    await onClose(newAcls);
  };

  const onApply = () => {
    onClose(newAcls);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('editor.manageStmtLangModal.title', {
          language: contentLanguage.name,
        })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <PermissionEditor
            permissions={
              new Set<Permission>([Permission.Edit, Permission.Approve])
            }
            defaultPermission={Permission.Edit}
            aclMap={acls}
            aclFixedMap={fixedAcls}
            onAclChange={setNewAcls}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{t('common.cancel')}</Button>
        <Button onClick={onApply} variant="contained" disabled={false}>
          {t('common.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageStmtLangModal;
