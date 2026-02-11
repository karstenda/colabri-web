import { useEffect, useState } from 'react';
import { SheetBlockBP } from './SheetBlockBP';
import { SheetContentBlockBP } from './SheetContentBlockBP';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { LoroEventBatch, LoroList, LoroMap, LoroMovableList } from 'loro-crdt';
import { Alert, Box, CircularProgress, Skeleton, Stack } from '@mui/material';
import { useContentLanguages } from '../../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../../data/ColabDoc';
import { useTranslation } from 'react-i18next';
import { SheetBlockLoro, SheetLoroDoc } from '../../../data/ColabLoroDoc';
import { ColabSheetBlockType } from '../../../../api/ColabriAPI';
import { SheetTextBlockBP } from '../SheetTextBlock/SheetTextBlockBP';
import { SheetStatementGridBlockBP } from '../SheetStatementGridBlock/SheetStatementGridBlockBP';
import SheetTextBlock from '../SheetTextBlock/SheetTextBlock';
import SheetStatementGridBlock from '../SheetStatementGridBlock/SheetStatementGridBlock';
import { SheetPropertiesBlockBP } from '../SheetPropertiesBlock/SheetPropertiesBlockBP';
import SheetPropertiesBlock from '../SheetPropertiesBlock/SheetPropertiesBlock';

export type SheetBlockProps = {
  bp: SheetBlockBP;
  readOnly?: boolean;
};

const DEFAULT_LANGCODE = 'en';

const SheetBlock = ({ bp, readOnly }: SheetBlockProps) => {
  const { t } = useTranslation();

  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error('SheetBlock can only be used with sheet docs.');
  }

  // Get the LoroDoc
  const loroDoc = colabDoc?.getLoroDoc();

  // Get the current organization
  const organization = useOrganization();

  // Get the configured languages
  const { languages } = useContentLanguages(organization?.id);

  // The state to track the SheetBlockBPs
  const [sheetContentBlockBPs, setSheetContentBlockBPs] = useState<
    SheetContentBlockBP[] | null
  >(null);

  useEffect(() => {
    // Ensure we have the LoroDoc
    if (!loroDoc || !languages) {
      return;
    }

    // Get the StatementModelContent from the LoroDoc
    const sheetModelContent = loroDoc.getMovableList('content');
    if (!sheetModelContent) {
      console.error(`Sheet model content could not be found.`);
      return;
    }

    // Generate the StatementElementBPs for each child
    updateSheetBlockBPs(sheetModelContent);

    // Bind to the LoroMap to listen for changes
    bindToLoro(loroDoc);
  }, [loroDoc, bp, languages]);

  /*
   * Bind this statement block to the LoroMap to listen for changes
   */
  const bindToLoro = (loroDoc: SheetLoroDoc) => {
    const blocksListLoro = loroDoc.getMovableList('content');

    // Subscribe to changes in the container
    const listener = loroDoc.subscribe((e: LoroEventBatch) => {
      // Iterate over the events
      e.events.forEach((event) => {
        // Check if the event is for our statement model content
        if (event.target === blocksListLoro.id) {
          // This means that we need to regenerate our StatementElementBPs
          updateSheetBlockBPs(blocksListLoro);
        }
      });
    });

    return listener;
  };

  // Update the StatementElementBPs based on the current content
  const updateSheetBlockBPs = (
    sheetModelContent: LoroMovableList<SheetBlockLoro>,
  ) => {
    const newSheetBlockBPs: SheetContentBlockBP[] = [];

    // Iterate over the blocks
    for (let i = 0; i < sheetModelContent.length; i++) {
      const sheetContentBlock = sheetModelContent.get(i);
      const blockType = (
        sheetContentBlock as LoroMap<{ type: ColabSheetBlockType }>
      ).get('type');
      switch (blockType) {
        case 'text': {
          // Text Block
          const textBlockBP: SheetTextBlockBP = {
            id: sheetContentBlock.id,
            type: 'text' as ColabSheetBlockType,
            containerId: sheetContentBlock.id,
            langCode: DEFAULT_LANGCODE,
            readOnly: readOnly,
          };
          newSheetBlockBPs.push(textBlockBP);
          break;
        }
        case 'statement-grid': {
          // Statement Grid Block
          const statementGridBlockBP: SheetStatementGridBlockBP = {
            id: sheetContentBlock.id,
            type: 'statement-grid' as ColabSheetBlockType,
            containerId: sheetContentBlock.id,
            readOnly: readOnly,
          };
          newSheetBlockBPs.push(statementGridBlockBP);
          break;
        }
        case 'properties': {
          // Properties Block
          const propertiesBlockBP: SheetPropertiesBlockBP = {
            id: sheetContentBlock.id,
            type: 'properties' as ColabSheetBlockType,
            containerId: sheetContentBlock.id,
          };
          newSheetBlockBPs.push(propertiesBlockBP);
          break;
        }
      }
    }

    // Set the ref
    setSheetContentBlockBPs(newSheetBlockBPs);
  };

  // Get the actual component
  return (
    <>
      <Stack
        spacing={2}
        sx={{ alignItems: 'center' }}
        className="EditorBackground"
      >
        {sheetContentBlockBPs == null && (
          <Skeleton variant="rounded" width="100%" height={100} />
        )}
        {sheetContentBlockBPs != null && sheetContentBlockBPs.length === 0 && (
          <Box>
            <Alert severity="info">
              {t('editor.sheetBlock.noBlocksAdded')}
            </Alert>
          </Box>
        )}
        {sheetContentBlockBPs != null &&
          sheetContentBlockBPs.map((sheetContentBlockBP) => {
            switch (sheetContentBlockBP.type) {
              case ColabSheetBlockType.ColabSheetBlockTypeText: {
                return (
                  <SheetTextBlock
                    key={sheetContentBlockBP.id}
                    bp={sheetContentBlockBP as SheetTextBlockBP}
                  />
                );
              }
              case ColabSheetBlockType.ColabSheetBlockTypeStatementGrid: {
                return (
                  <SheetStatementGridBlock
                    key={sheetContentBlockBP.id}
                    bp={sheetContentBlockBP as SheetStatementGridBlockBP}
                  />
                );
              }
              case ColabSheetBlockType.ColabSheetBlockTypeProperties: {
                return (
                  <SheetPropertiesBlock
                    key={sheetContentBlockBP.id}
                    bp={sheetContentBlockBP as SheetPropertiesBlockBP}
                  />
                );
              }
              default: {
                return <></>;
              }
            }
          })}
      </Stack>
    </>
  );
};
export default SheetBlock;
