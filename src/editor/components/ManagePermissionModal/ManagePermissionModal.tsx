import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import PermissionEditor from '../../../ui/components/PermissionEditor/PermissionEditor';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { Permission } from '../../../ui/data/Permission';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useContentLanguages,
  usePlatformContentLanguages,
} from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { ContentLanguage } from '../../data/ContentLanguage';

export type ManagePermissionModalPayload = {
  orgId: string;
  langCode: string; // Used for title
  acls: Record<Permission, string[]>;
  docAcls: Record<Permission, string[]>;
};

export interface ManagePermissionModalProps
  extends DialogProps<
    ManagePermissionModalPayload,
    Record<Permission, string[]> | undefined
  > {}

const ManagePermissionModal = ({
  open,
  payload,
  onClose,
}: ManagePermissionModalProps) => {
  // Extract the payload
  const { orgId, langCode, acls, docAcls } = payload;

  const { t } = useTranslation();

  const { languages, isLoading: isLanguagesLoading } =
    useContentLanguages(orgId);

  // Get the language
  let contentLanguage: ContentLanguage | undefined = languages.find(
    (l) => l.code === langCode,
  );
  // If not found, try to get it from platform languages
  let isNonOrgContentLanguages = false;
  const { languages: platformLanguages } = usePlatformContentLanguages(
    !contentLanguage && !isLanguagesLoading,
  );
  if (!contentLanguage && !isLanguagesLoading) {
    contentLanguage = platformLanguages.find((l) => l.code === langCode);
    isNonOrgContentLanguages = true;
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
          language: contentLanguage?.name || langCode,
        })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <PermissionEditor
            permissions={{
              default: new Set<Permission>([
                Permission.Edit,
                Permission.Approve,
              ]),
            }}
            defaultPermission={Permission.Edit}
            aclMap={acls}
            aclFixedMap={docAcls}
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

export default ManagePermissionModal;
