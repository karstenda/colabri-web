import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import PermissionEditor from '../../../ui/components/PermissionEditor/PermissionEditor';
import { StmtLoroDoc } from '../../data/ColabDoc';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { Permission } from '../../../ui/data/Permission';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export type ManageSheetPermissionModalPayload = {
  docName: string;
  loroDoc: StmtLoroDoc;
};

export interface ManageSheetPermissionModalProps
  extends DialogProps<
    ManageSheetPermissionModalPayload,
    Record<Permission, string[]> | null
  > {}
const ManageSheetPermissionModal = ({
  open,
  payload,
  onClose,
}: ManageSheetPermissionModalProps) => {
  // Extract the payload
  const { loroDoc, docName } = payload;

  // The translation hook
  const { t } = useTranslation();

  // Extract the aclMap from the loroDoc
  const docAclMap = loroDoc.getMap('acls');
  let acls;
  if (!docAclMap) {
    acls = {};
  } else {
    acls = docAclMap.toJSON();
  }

  // Remember the new acls in the state
  const [newAcls, setNewAcls] = useState<Record<Permission, string[]>>(acls);

  const handleCancel = async () => {
    await onClose(null);
  };

  const onApply = () => {
    onClose(newAcls);
  };

  const onAclChange = (updatedAcls: Record<Permission, string[]>) => {
    setNewAcls(updatedAcls);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('editor.managePermissionModal.title', { documentName: docName })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <PermissionEditor
            permissions={{
              [t('permissions.sections.document')]: new Set<Permission>([
                Permission.View,
                Permission.Manage,
                Permission.AddRemove,
              ]),
              [t('permissions.sections.block')]: new Set<Permission>([
                Permission.Edit,
                Permission.Approve,
              ]),
            }}
            defaultPermission={Permission.View}
            aclMap={acls}
            onAclChange={onAclChange}
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

export default ManageSheetPermissionModal;
