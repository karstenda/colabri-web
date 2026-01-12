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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useContentLanguages,
  usePlatformContentLanguages,
} from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { ContentLanguage } from '../../data/ContentLanguage';

export type ManageStmtLangModalPayload = {
  orgId: string;
  langCode: string;
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
  const { orgId, langCode, loroDoc } = payload;

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

  // Extract the aclMap from the loroDoc
  const docAclMap = loroDoc.getMap('acls');
  let fixedAcls;
  if (!docAclMap) {
    fixedAcls = {};
  } else {
    fixedAcls = docAclMap.toJSON();
  }

  // Extract the aclMap from this element
  const aclMap = loroDoc.getMap('content')?.get(langCode)?.get('acls');
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
          language: contentLanguage?.name || langCode,
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
