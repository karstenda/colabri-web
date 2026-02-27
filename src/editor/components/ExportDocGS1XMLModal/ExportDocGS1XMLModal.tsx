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
import LocaleMapping from '../LocaleMapping/LocaleMapping';
import { useExportGS1XML } from '../../../ui/hooks/useExportGS1XML/useExportGS1XML';

export interface ExportDocGS1XMLModalPayload {
  sheetDoc: ConnectedSheetDoc;
}

export interface ExportDocGS1XMLModalProps extends DialogProps<
  ExportDocGS1XMLModalPayload,
  void
> {}

export const ExportDocGS1XMLModal: React.FC<ExportDocGS1XMLModalProps> = ({
  open,
  onClose,
  payload,
}) => {
  // Get the translation function
  const { t } = useTranslation();

  // Get the languages
  const organization = useOrganization();
  const { languages = [] } = useContentLanguages(organization?.id);

  // Check if there is already a properties block
  const sheetDoc = payload.sheetDoc;
  const docName = sheetDoc.getDocName();
  const docId = sheetDoc.getDocId();
  const loroDoc = sheetDoc.getLoroDoc();

  // Get the hook to export
  const { exportGS1XML, gs1XML, isPending, error } = useExportGS1XML(
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

  // Create an initial locale mapping based on the sheet languages
  const initialLocaleMapping: Record<number, ContentLanguage> = {};
  sheetLanguages.forEach((language, index) => {
    initialLocaleMapping[index + 1] = language;
  });

  // The state
  const [localeMapping, setLocaleMapping] = useState<
    Record<number, ContentLanguage> | undefined
  >(initialLocaleMapping);

  const handleExport = async () => {
    // Make sure thre is a locale mapping
    if (
      localeMapping === undefined ||
      Object.keys(localeMapping).length === 0
    ) {
      return;
    }

    // Make a map to conver the mapping from locale index to language code
    const localeLangCodeMapping: Record<string, string> = {};
    for (const [localeIndex, language] of Object.entries(localeMapping)) {
      localeLangCodeMapping[localeIndex] = language.code;
    }

    // Export the GS1 XML with the mapping
    const response = await exportGS1XML({
      localeMapping: localeLangCodeMapping,
    });

    // Trigger file download
    const xmlContent = response.data;
    if (xmlContent) {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docName} - export.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onClose(undefined);
    }
  };

  const handleCancel = () => {
    onClose(undefined);
    setLocaleMapping(undefined);
  };

  const handleLocaleChange = (value: Record<string, ContentLanguage>) => {
    // Handle the locale change
    setLocaleMapping(value);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('editor.exportDocGS1XMLModal.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {t('editor.exportDocGS1XMLModal.description')}
        </Typography>
        <Box sx={{ pt: 2 }}>
          <LocaleMapping
            languages={sheetLanguages}
            initLocaleMap={initialLocaleMapping}
            onChange={handleLocaleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{t('common.cancel')}</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={!localeMapping || Object.keys(localeMapping).length === 0}
        >
          {t('common.export')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDocGS1XMLModal;
