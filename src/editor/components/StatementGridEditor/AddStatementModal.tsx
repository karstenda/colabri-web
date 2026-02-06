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
import { LanguageSelector } from '../../../ui/components/LanguageSelector/LanguageSelector';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import type {
  OrgContentLanguage,
  StatementDocument,
} from '../../../api/ColabriAPI';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import { ContentTypeSelector } from '../../../ui/components/ContentTypeSelector';
import StatementsGrid from '../../../ui/components/StatementsOverview';
import { ContentLanguage } from '../../data/ContentLanguage';
import { useLibraries } from '../../../ui/hooks/useLibraries/useLibraries';
import { DocumentType } from '../../../api/ColabriAPI';

export interface NewStatementData {
  statementSource: 'new' | 'my-statements' | 'library';
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
  const { libraries } = useLibraries(
    organization?.id || '',
    organization != null,
  );
  const stmtLibraries = libraries.filter(
    (lib) => lib.type === DocumentType.DocumentTypeColabStatement,
  );

  // Selected tab state
  const [selectedTab, setSelectedTab] = useState(0);
  let statementSource: 'new' | 'my-statements' | 'library';
  if (selectedTab === 0) {
    statementSource = 'new';
  } else if (selectedTab === 1) {
    statementSource = 'my-statements';
  } else {
    statementSource = 'library';
  }
  const activeLibrary =
    statementSource === 'library' ? stmtLibraries[selectedTab - 2] : null;

  // Selected content type state
  const [selectedContentType, setSelectedContentType] = useState<
    string | undefined
  >(undefined);

  // Selected languages state
  const [selectedLanguages, setSelectedLanguages] =
    useState<ContentLanguage[]>(docLanguages);

  // Selected library statements state
  const [selectedStatements, setSelectedStatements] = useState<
    StatementDocument[]
  >([]);

  // whether to enable the Add button
  let enableAddButton = false;
  if (statementSource === 'library' || statementSource === 'my-statements') {
    enableAddButton = selectedStatements.length > 0;
  } else if (statementSource === 'new') {
    enableAddButton = selectedLanguages.length > 0 && !!selectedContentType;
  }

  const handleAdd = () => {
    if (statementSource === 'library' || statementSource === 'my-statements') {
      if (selectedStatements.length > 0) {
        onClose({
          statementSource: statementSource,
          statements: selectedStatements,
        });
        setSelectedStatements([]);
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
    value: ContentLanguage | ContentLanguage[] | null,
  ) => {
    if (Array.isArray(value)) {
      setSelectedLanguages(value);
    } else if (value) {
      setSelectedLanguages([value]);
    } else {
      setSelectedLanguages([]);
    }
  };

  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue);
    setSelectedContentType(undefined);
    setSelectedLanguages(docLanguages);
    setSelectedStatements([]);
  };

  const handleStatementsSelect = (selectedStatements: StatementDocument[]) => {
    // Save the state
    setSelectedStatements(selectedStatements);
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
            onChange={(e, newValue) => handleTabChange(newValue)}
          >
            <Tab
              label={t('editor.addStatementModal.newStatementTab')}
              id="new-statement"
              aria-controls="tabpanel-new"
            />
            <Tab
              label={t('editor.addStatementModal.myStatementsTab')}
              id="my-statements"
              aria-controls="tabpanel-my-statements"
            />
            {stmtLibraries.length > 0 &&
              stmtLibraries.map((lib) => (
                <Tab
                  key={lib.id}
                  label={
                    lib.name
                      .toLocaleLowerCase()
                      .endsWith(t('common.library').toLocaleLowerCase())
                      ? lib.name
                      : lib.name + ' ' + t('common.library')
                  }
                  id={`library-statement-${lib.id}`}
                  aria-controls={`tabpanel-library-${lib.id}`}
                />
              ))}
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
          {statementSource === 'my-statements' && (
            <StatementsGrid
              selectable={true}
              scope={{ type: 'my' }}
              onSelectionChange={handleStatementsSelect}
            />
          )}
          {statementSource === 'library' && (
            <StatementsGrid
              selectable={true}
              scope={{ type: 'lib', libraryId: activeLibrary?.id }}
              onSelectionChange={handleStatementsSelect}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!enableAddButton}
        >
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStatementModal;
