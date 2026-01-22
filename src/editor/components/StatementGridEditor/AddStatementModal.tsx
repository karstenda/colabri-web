import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
} from '@mui/material';
import {
  LanguageSelector,
  LanguageOption,
} from '../../../ui/components/LanguageSelector/LanguageSelector';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import type { OrgContentLanguage } from '../../../api/ColabriAPI';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import { ContentTypeSelector } from '../../../ui/components/ContentTypeSelector';

export interface NewStatementData {
  contentType: string;
  langCodes: string[];
}

export interface AddStatementModalPayload {
  docLanguages: OrgContentLanguage[];
}

export interface AddStatementModalProps
  extends DialogProps<AddStatementModalPayload, NewStatementData | undefined> {}

export const AddStatementModal: React.FC<AddStatementModalProps> = ({
  open,
  onClose,
  payload,
}) => {
  const { t } = useTranslation();
  const { docLanguages } = payload;
  const organization = useOrganization();
  const [selectedContentType, setSelectedContentType] = useState<
    string | undefined
  >(undefined);
  const [selectedLanguages, setSelectedLanguages] =
    useState<LanguageOption[]>(docLanguages);

  const handleAdd = () => {
    if (selectedLanguages.length > 0) {
      if (selectedContentType) {
        onClose({
          contentType: selectedContentType,
          langCodes: selectedLanguages.map((lang) => lang.code!),
        });
      } else {
        onClose(undefined);
      }
      setSelectedLanguages([]);
    }
  };

  const handleCancel = () => {
    onClose(undefined);
    setSelectedLanguages([]);
  };

  const handleContentTypeChange = (value: string | string[] | null) => {
    if (Array.isArray(value)) {
      if (value.length === 1) {
        setSelectedContentType(value[0]);
      } else {
        setSelectedContentType(undefined);
      }
    } else if (value) {
      setSelectedContentType(value);
    } else {
      setSelectedContentType(undefined);
    }
  };

  const handleLanguagesChange = (
    value: LanguageOption | LanguageOption[] | null,
  ) => {
    if (Array.isArray(value)) {
      setSelectedLanguages(value);
    } else if (value) {
      setSelectedLanguages([value]);
    } else {
      setSelectedLanguages([]);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('editor.addStatementModal.title')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ paddingTop: '16px' }}>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <ContentTypeSelector
              orgId={organization?.id || ''}
              value={selectedContentType}
              onChange={handleContentTypeChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
            <LanguageSelector
              scope="organization"
              orgId={organization?.id}
              multiple={true}
              value={selectedLanguages}
              onChange={handleLanguagesChange}
              label={t('languages.selectLanguages')}
              placeholder={t('languages.selectPlaceholder')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedContentType}
        >
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStatementModal;
