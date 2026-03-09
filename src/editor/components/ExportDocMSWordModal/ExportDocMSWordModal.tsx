import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import { ConnectedSheetDoc } from '../../data/ColabDoc';
import { useContentLanguages } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ContentLanguage } from '../../data/ContentLanguage';
import { useExportDocx } from '../../../ui/hooks/useExport/useExport';
import { LanguageSelector } from '../../../ui/components/LanguageSelector';
import useNotifications from '../../../ui/hooks/useNotifications/useNotifications';

export interface ExportDocMSWordModalPayload {
  sheetDoc: ConnectedSheetDoc;
}

export interface ExportDocMSWordModalProps extends DialogProps<
  ExportDocMSWordModalPayload,
  void
> {}

export const ExportDocMSWordModal: React.FC<ExportDocMSWordModalProps> = ({
  open,
  onClose,
  payload,
}) => {
  // Get the translation function
  const { t } = useTranslation();
  const notifications = useNotifications();

  // Get the languages
  const organization = useOrganization();
  const { languages = [] } = useContentLanguages(organization?.id);

  // Check if there is already a properties block
  const sheetDoc = payload.sheetDoc;
  const docName = sheetDoc.getDocName();
  const docId = sheetDoc.getDocId();
  const loroDoc = sheetDoc.getLoroDoc();

  // Get the hook to export
  const { exportDocx, docx, isPending, error } = useExportDocx(
    organization ? organization.id : '',
    docId,
  );

  // Target the global properties map
  const propertiesMap = loroDoc.getMap('properties');
  const langCodes = propertiesMap.get('langCodes');
  let sheetLanguages: ContentLanguage[] = [];
  if (langCodes) {
    sheetLanguages = languages?.filter((lang) => {
      for (let i = 0; i < langCodes.length; i++) {
        if (lang.code === langCodes.get(i)) {
          return true;
        }
      }
      return false;
    });
  }

  // The state
  const [selectedLanguages, setSelectedLanguages] = useState<
    ContentLanguage[] | undefined
  >(sheetLanguages);

  const handleExport = async () => {
    // Make sure thre is a locale mapping
    if (selectedLanguages === undefined || selectedLanguages.length === 0) {
      return;
    }

    try {
      // Export the DOCX with the mapping
      const docxContent = await exportDocx({
        languageCodes: selectedLanguages.map((lang) => lang.code),
      });

      // Trigger file download
      if (docxContent) {
        const url = URL.createObjectURL(docxContent);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${docName} - export.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onClose(undefined);
      }
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      notifications.show('Error exporting DOCX', { severity: 'error' });
    }
  };

  const handleCancel = () => {
    onClose(undefined);
    setSelectedLanguages(undefined);
  };

  const handleLangChange = (
    value: ContentLanguage | ContentLanguage[] | null,
  ) => {
    if (value === null) {
      setSelectedLanguages([]);
      return;
    } else if (Array.isArray(value)) {
      setSelectedLanguages(value);
      return;
    } else {
      setSelectedLanguages([value]);
      return;
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('editor.exportDocMSWordModal.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {t('editor.exportDocMSWordModal.description')}
        </Typography>
        <Box sx={{ pt: 2 }}>
          <LanguageSelector
            scope={'organization'}
            orgId={organization?.id}
            multiple={true}
            value={selectedLanguages}
            onChange={handleLangChange}
            filterOptions={(options) => {
              if (!sheetLanguages || sheetLanguages.length === 0) {
                return options;
              } else {
                const sheetLangCodes = sheetLanguages.map((lang) => lang.code);
                return options.filter((option) =>
                  sheetLangCodes.includes(option.code),
                );
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{t('common.cancel')}</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={!selectedLanguages || selectedLanguages.length === 0}
        >
          {t('common.export')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDocMSWordModal;
