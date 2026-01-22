import { useEffect, useState } from 'react';
import { StatementBlockBP } from './StatementBlockBP';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { StatementElementBlockBP } from '../StatementElementBlock/StatementElementBlockBP';
import { LoroDoc, LoroEventBatch, LoroMap } from 'loro-crdt';
import StatementElementBlock from '../StatementElementBlock/StatementElementBlock';
import { Alert, Box, CircularProgress, Skeleton, Stack } from '@mui/material';
import { useContentLanguages } from '../../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ConnectedStmtDoc } from '../../../data/ConnectedColabDoc';
import { useTranslation } from 'react-i18next';

export type StatementBlockProps = {
  bp: StatementBlockBP;
};

const StatementBlock = ({ bp }: StatementBlockProps) => {
  const { t } = useTranslation();

  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedStmtDoc)) {
    throw new Error(
      'StatementBlock can only be used with connected statement docs.',
    );
  }

  // Get the LoroDoc
  const loroDoc = colabDoc?.getLoroDoc();

  // Get the current organization
  const organization = useOrganization();

  // Get the configured languages
  const { languages } = useContentLanguages(organization?.id);

  // The state to track the StatementElementBPs
  const [smtmElementsBPs, setStmtElementsBPs] = useState<
    StatementElementBlockBP[] | null
  >(null);

  useEffect(() => {
    // Ensure we have the LoroDoc
    if (!loroDoc || !languages) {
      return;
    }

    // Get the StatementModelContent from the LoroDoc
    const stmtModelContent = loroDoc.getMap('content') as LoroMap | undefined;
    if (!stmtModelContent) {
      console.error(`Statement model content could not be found.`);
      return;
    }

    // Generate the StatementElementBPs for each child
    updateStatementElementBPs(stmtModelContent);

    // Bind to the LoroMap to listen for changes
    bindToLoro(loroDoc);
  }, [loroDoc, bp, languages]);

  /*
   * Bind this statement block to the LoroMap to listen for changes
   */
  const bindToLoro = (loroDoc: LoroDoc) => {
    const stmtModelContent = loroDoc.getMap('content');

    // Subscribe to changes in the container
    const listener = loroDoc.subscribe((e: LoroEventBatch) => {
      // Iterate over the events
      e.events.forEach((event) => {
        // Check if the event is for our statement model content
        if (event.target === stmtModelContent.id) {
          // This means that we need to regenerate our StatementElementBPs
          updateStatementElementBPs(stmtModelContent);
        }
      });
    });

    return listener;
  };

  // Update the StatementElementBPs based on the current content
  const updateStatementElementBPs = (stmtModelContent: LoroMap) => {
    const newStmtElementBPs: StatementElementBlockBP[] = [];
    stmtModelContent.keys().forEach((langCode) => {
      const smtElement = stmtModelContent.get(langCode) as LoroMap;
      if (smtElement) {
        newStmtElementBPs.push({
          id: smtElement.id,
          langCode: langCode,
          containerId: smtElement.id,
        });
      }
    });

    // Sort the StatementElementBPs by language name
    newStmtElementBPs.sort((a, b) => {
      // Lookup the name of the languages
      const langA = languages.find((l) => l.code === a.langCode);
      const langB = languages.find((l) => l.code === b.langCode);
      const nameA = langA ? langA.name : a.langCode;
      const nameB = langB ? langB.name : b.langCode;
      return nameA.localeCompare(nameB);
    });

    // Set the ref
    setStmtElementsBPs(newStmtElementBPs);
  };

  // Get the
  return (
    <>
      <Stack
        spacing={2}
        sx={{ alignItems: 'center' }}
        className="EditorBackground"
      >
        {smtmElementsBPs == null && (
          <Skeleton variant="rounded" width="100%" height={100} />
        )}
        {languages.length === 0 && (
          <Box>
            <Alert severity="info">
              {t('editor.statementBlock.noLanguagesConfigured')}
            </Alert>
          </Box>
        )}
        {languages.length > 0 &&
          smtmElementsBPs != null &&
          smtmElementsBPs.length === 0 && (
            <Box>
              <Alert severity="info">
                {t('editor.statementBlock.noLanguagesAvailable')}
              </Alert>
            </Box>
          )}
        {smtmElementsBPs != null &&
          smtmElementsBPs.map((smtElementBP) => (
            <StatementElementBlock
              key={smtElementBP.langCode}
              bp={smtElementBP}
            />
          ))}
      </Stack>
    </>
  );
};
export default StatementBlock;
