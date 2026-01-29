import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Tabs,
  Tab,
  Stack,
  Typography,
} from '@mui/material';
import {
  LanguageSelector,
  LanguageOption,
} from '../../../ui/components/LanguageSelector/LanguageSelector';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import type {
  OrgContentLanguage,
  StatementDocument,
} from '../../../api/ColabriAPI';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import { ContentTypeSelector } from '../../../ui/components/ContentTypeSelector';
import StatementsGrid from '../../../ui/components/StatementsOverview';

export interface NewStatementData {
  statementSource: 'new' | 'library';
  statements?: StatementDocument[];
  contentType?: string;
  langCodes?: string[];
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

  // Selected tab state
  const [selectedTab, setSelectedTab] = useState(0);
  const statementSource = selectedTab === 0 ? 'new' : 'library';

  // Selected content type state
  const [selectedContentType, setSelectedContentType] = useState<
    string | undefined
  >(undefined);

  // Selected languages state
  const [selectedLanguages, setSelectedLanguages] =
    useState<LanguageOption[]>(docLanguages);

  // Selected library statements state
  const [selectedLibStatements, setSelectedLibStatements] = useState<
    StatementDocument[]
  >([]);

  const handleAdd = () => {
    if (statementSource === 'library') {
      if (selectedLibStatements.length > 0) {
        onClose({
          statementSource: 'library',
          statements: selectedLibStatements,
        });
        setSelectedLibStatements([]);
      }
    } else if (statementSource === 'new') {
      if (selectedLanguages.length > 0) {
        if (selectedContentType) {
          onClose({
            statementSource: 'new',
            contentType: selectedContentType,
            langCodes: selectedLanguages.map((lang) => lang.code!),
          });
          setSelectedLanguages([]);
          setSelectedContentType(undefined);
        } else {
          onClose(undefined);
        }
        setSelectedLanguages([]);
      }
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

  const handleLibStatementsSelect = (
    selectedStatements: StatementDocument[],
  ) => {
    // Save the state
    setSelectedLibStatements(selectedStatements);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth={statementSource === 'new' ? 'sm' : 'xl'}
      fullWidth
    >
      <DialogContent>
        <Stack spacing={2}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
          >
            <Tab
              label="New Statement"
              id="new-statement"
              aria-controls="tabpanel-new"
            />
            <Tab
              label="Library"
              id="library-statement"
              aria-controls="tabpanel-library"
            />
          </Tabs>

          {statementSource === 'new' && (
            <>
              <Box>
                <Typography variant="body2" sx={{ paddingBottom: '8px' }}>
                  {t('editor.addStatementModal.newStatementDescription')}
                </Typography>
              </Box>
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
            </>
          )}
          {statementSource === 'library' && (
            <StatementsGrid
              editable={false}
              selectable={true}
              scope="lib"
              onSelectionChange={handleLibStatementsSelect}
            />
          )}
        </Stack>
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
