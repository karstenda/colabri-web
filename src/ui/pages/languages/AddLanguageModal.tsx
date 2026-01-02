import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { DialogProps } from '../../hooks/useDialogs/useDialogs';
import { LanguageSelector } from '../../components/LanguageSelector';
import type { PlatformContentLanguage } from '../../../api/ColabriAPI';

export interface AddLanguageModalPayload {
  orgId: string;
}

export interface AddLanguageModalProps
  extends DialogProps<AddLanguageModalPayload, string[]> {}

export function AddLanguageModal({ open, onClose }: AddLanguageModalProps) {
  const { t } = useTranslation();
  const [selectedLanguages, setSelectedLanguages] = React.useState<
    PlatformContentLanguage[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const handleCancel = async () => {
    await onClose([]);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Extract language codes from selected languages
      const languageCodes = selectedLanguages
        .map((lang) => lang.code)
        .filter((code): code is string => !!code);
      await onClose(languageCodes);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (
    value:
      | string
      | string[]
      | PlatformContentLanguage
      | PlatformContentLanguage[]
      | null,
  ) => {
    if (Array.isArray(value)) {
      // Filter to ensure we only have PlatformContentLanguage objects
      const languages = value.filter(
        (v): v is PlatformContentLanguage =>
          typeof v === 'object' && v !== null && 'code' in v,
      );
      setSelectedLanguages(languages);
    } else {
      setSelectedLanguages([]);
    }
  };

  const isConfirmDisabled = selectedLanguages.length === 0;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('languages.addModal.title')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('languages.addModal.description')}
          </Typography>

          <LanguageSelector
            scope="platform"
            multiple
            value={selectedLanguages}
            onChange={handleSelectionChange}
            label={t('languages.addModal.selectLabel')}
            placeholder={t('languages.addModal.selectPlaceholder')}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || isConfirmDisabled}
        >
          {t('languages.addModal.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddLanguageModal;
