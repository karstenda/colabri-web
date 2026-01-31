import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { LanguageSelector } from '../../../ui/components/LanguageSelector/LanguageSelector';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import type { OrgContentLanguage } from '../../../api/ColabriAPI';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import { ContentLanguage } from '../../data/ContentLanguage';

export interface AddLanguageModalPayload {
  existingLanguages: OrgContentLanguage[];
}

export interface AddLanguageModalProps
  extends DialogProps<AddLanguageModalPayload, OrgContentLanguage[]> {}

export const AddLanguageModal: React.FC<AddLanguageModalProps> = ({
  open,
  onClose,
  payload,
}) => {
  const { t } = useTranslation();
  const { existingLanguages } = payload;
  const organization = useOrganization();
  const [selectedLanguages, setSelectedLanguages] = useState<ContentLanguage[]>(
    [],
  );

  // Get codes of existing languages to filter them out
  const existingLanguageCodes = existingLanguages.map((lang) => lang.code);

  // Filter available options to exclude already added languages
  const filterOptions = (options: ContentLanguage[]) => {
    return options.filter(
      (option) => option.code && !existingLanguageCodes.includes(option.code),
    );
  };

  const handleAdd = () => {
    if (selectedLanguages.length > 0) {
      onClose(selectedLanguages as OrgContentLanguage[]);
      setSelectedLanguages([]);
    }
  };

  const handleCancel = () => {
    onClose([]);
    setSelectedLanguages([]);
  };

  const handleChange = (
    value: string | string[] | ContentLanguage | ContentLanguage[] | null,
  ) => {
    if (Array.isArray(value)) {
      // Filter out string values and keep only LanguageOption objects
      const languageOptions = value.filter(
        (item): item is ContentLanguage => typeof item !== 'string',
      );
      setSelectedLanguages(languageOptions);
    } else {
      setSelectedLanguages([]);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('editor.addLanguageModal.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <LanguageSelector
            scope="organization"
            orgId={organization?.id}
            multiple={true}
            value={selectedLanguages}
            onChange={handleChange}
            label={t('languages.selectLanguages')}
            placeholder={t('languages.selectPlaceholder')}
            filterOptions={filterOptions}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={selectedLanguages.length === 0}
        >
          {t('common.add')}{' '}
          {selectedLanguages.length > 0 ? `(${selectedLanguages.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLanguageModal;
