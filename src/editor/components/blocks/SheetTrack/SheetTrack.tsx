import { useEffect, useState } from 'react';
import { SheetTrackBlockBP } from './SheetTrackBlockBP';
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
import { SheetBarcodeGridBlockBP } from '../SheetBarcodeGridBlock/SheetBarcodeGridBlockBP';

export type SheetTrackProps = {
  readOnly?: boolean;
};

const DEFAULT_LANGCODE = 'en';

const SheetTrack = ({ readOnly }: SheetTrackProps) => {
  const { t } = useTranslation();

  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error('SheetTrack can only be used with sheet docs.');
  }

  // Get the LoroDoc
  const loroDoc = colabDoc?.getLoroDoc();

  // Get the current organization
  const organization = useOrganization();

  // Get the configured languages
  const { languages } = useContentLanguages(organization?.id);

  // The state to track the SheetTrackBlockBPs
  const [sheetTrackBlockBPs, setSheetTrackBlockBPs] = useState<
    SheetTrackBlockBP[] | null
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

    // Generate the BPs for each child
    updateSheetTrackBPs(sheetModelContent);

    // Bind to the LoroMap to listen for changes
    bindToLoro(loroDoc);
  }, [loroDoc, languages]);

  /*
   * Bind this sheet track to the LoroMap to listen for changes
   */
  const bindToLoro = (loroDoc: SheetLoroDoc) => {
    const blocksListLoro = loroDoc.getMovableList('content');

    // Subscribe to changes in the container
    const listener = loroDoc.subscribe((e: LoroEventBatch) => {
      // Iterate over the events
      e.events.forEach((event) => {
        // Check if the event is for our sheet model content
        if (event.target === blocksListLoro.id) {
          // This means that we need to regenerate our SheetTrackBPs
          updateSheetTrackBPs(blocksListLoro);
        }
      });
    });

    return listener;
  };

  // Update the SheetTrackBPs based on the current content
  const updateSheetTrackBPs = (
    sheetModelContent: LoroMovableList<SheetBlockLoro>,
  ) => {
    const newSheetTrackBPs: SheetTrackBlockBP[] = [];

    // Iterate over the blocks
    for (let i = 0; i < sheetModelContent.length; i++) {
      const sheetContentBlock = sheetModelContent.get(i);
      const blockType = (
        sheetContentBlock as LoroMap<{ type: ColabSheetBlockType }>
      ).get('type');
      switch (blockType) {
        case 'properties': {
          // Properties Block
          const propertiesBlockBP: SheetPropertiesBlockBP = {
            id: sheetContentBlock.id,
            type: 'properties' as ColabSheetBlockType,
            containerId: sheetContentBlock.id,
          };
          newSheetTrackBPs.push(propertiesBlockBP);
          break;
        }
        case 'attributes': {
          // Attributes Block - Not implemented yet
          break;
        }
        case 'text': {
          // Text Block
          const textBlockBP: SheetTextBlockBP = {
            id: sheetContentBlock.id,
            type: 'text' as ColabSheetBlockType,
            containerId: sheetContentBlock.id,
            langCode: DEFAULT_LANGCODE,
            readOnly: readOnly,
          };
          newSheetTrackBPs.push(textBlockBP);
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
          newSheetTrackBPs.push(statementGridBlockBP);
          break;
        }
        case 'barcode-grid': {
          // Barcode Grid Block
          const barcodeGridBlockBP: SheetBarcodeGridBlockBP = {
            id: sheetContentBlock.id,
            type: 'barcode-grid' as ColabSheetBlockType,
            containerId: sheetContentBlock.id,
            readOnly: readOnly,
          };
          newSheetTrackBPs.push(barcodeGridBlockBP);
          break;
        }
        case 'symbol-grid': {
          // Symbol Grid Block - Not implemented yet
          break;
        }
      }
    }

    // Set the ref
    setSheetTrackBlockBPs(newSheetTrackBPs);
  };

  // Get the actual component
  return (
    <>
      <Stack
        spacing={2}
        sx={{ alignItems: 'center' }}
        className="EditorBackground"
      >
        {sheetTrackBlockBPs == null && (
          <Skeleton variant="rounded" width="100%" height={100} />
        )}
        {sheetTrackBlockBPs != null && sheetTrackBlockBPs.length === 0 && (
          <Box>
            <Alert severity="info">
              {t('editor.sheetTrack.noBlocksAdded')}
            </Alert>
          </Box>
        )}
        {sheetTrackBlockBPs != null &&
          sheetTrackBlockBPs.map((sheetTrackBlockBP) => {
            switch (sheetTrackBlockBP.type) {
              case ColabSheetBlockType.ColabSheetBlockTypeProperties: {
                return (
                  <SheetPropertiesBlock
                    key={sheetTrackBlockBP.id}
                    bp={sheetTrackBlockBP as SheetPropertiesBlockBP}
                  />
                );
              }
              case ColabSheetBlockType.ColabSheetBlockTypeAttributes: {
                return <></>;
              }
              case ColabSheetBlockType.ColabSheetBlockTypeText: {
                return (
                  <SheetTextBlock
                    key={sheetTrackBlockBP.id}
                    bp={sheetTrackBlockBP as SheetTextBlockBP}
                  />
                );
              }
              case ColabSheetBlockType.ColabSheetBlockTypeStatementGrid: {
                return (
                  <SheetStatementGridBlock
                    key={sheetTrackBlockBP.id}
                    bp={sheetTrackBlockBP as SheetStatementGridBlockBP}
                  />
                );
              }
              case ColabSheetBlockType.ColabSheetBlockTypeBarcodeGrid: {
                return (
                  <SheetStatementGridBlock
                    key={sheetTrackBlockBP.id}
                    bp={sheetTrackBlockBP as SheetBarcodeGridBlockBP}
                  />
                );
              }
              case ColabSheetBlockType.ColabSheetBlockTypeSymbolGrid: {
                return <></>;
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
export default SheetTrack;
