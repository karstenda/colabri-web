import { useEffect, useRef } from 'react';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { LoroMap } from 'loro-crdt';
import { LoroDocType } from 'loro-prosemirror';
import ColabEphemeralStoreManager from './EphemeralStoreManager';
import {
  EditorContentLeftColumn,
  EditorContentMainColumn,
  EditorContentRightColumn,
  EditorContentWrapper,
  EditorHeaderWrapper,
  EditorTopHeaderLeftStack,
  EditorTopHeaderRightStack,
  EditorTopHeaderWrapper,
  EditorToolbarWrapper,
  EditorWrapper,
  DocumentTypeLabel,
} from './ColabDocEditorStyles';
import ColabriSvgIcon from '../../../ui/components/MainLayout/icons/ColabriSvgIcon';
import ShareIcon from '@mui/icons-material/Share';
import ProfileMenu from '../../../ui/components/ProfileMenu/ProfileMenu';
import ThemeSwitcher from '../../../ui/components/ThemeSwitcher/ThemeSwitcher';
import { Button, Stack, Typography } from '@mui/material';
import ColabDocEditorProvider from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import ToolbarMenu from '../ToolbarMenu/ToolbarMenu';
import StatementBlock from '../blocks/StatementBlock/StatementBlock';
import { useContentTypes } from '../../../ui/hooks/useTemplates/useTemplates';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ContentType } from '../../../api/ColabriAPI';

export default function ColabDocEditor() {
  // Get the ColabDoc context
  const { colabDoc } = useColabDoc();

  // Get the organization
  const organization = useOrganization();

  // Get the content types
  const { contentTypes } = useContentTypes(
    organization?.id || '',
    organization != null,
  );

  // Reference to the LoroDoc
  const loroDocRef = useRef<LoroDocType | null>(null);
  const ephStoreMgrRef = useRef<ColabEphemeralStoreManager | null>(null);

  // Reference to the content type
  const contentTypeRef = useRef<ContentType | null>(null);

  // Initialize version display and set up subscription
  useEffect(() => {
    // Make sure we have the loroDoc and update function
    if (!colabDoc) {
      return;
    }

    // For now, just target english 'en' content
    const loroDoc = colabDoc.loroDoc;

    // Get the content type from the properties
    const propertiesMap = loroDoc.getMap('properties') as LoroMap | undefined;
    if (propertiesMap) {
      const contentTypeCode = propertiesMap.get('contentType') as
        | string
        | undefined;
      const contentType = contentTypes.find(
        (ct) => ct.code === contentTypeCode,
      );
      contentTypeRef.current = contentType || null;
    }

    // Store the correct references
    loroDocRef.current = loroDoc as LoroDocType;
    ephStoreMgrRef.current = colabDoc.ephStoreMgr;

    // Listen for changes in the LoroDoc
    const unsubscribe = loroDoc.subscribe(() => {
      // TODO
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [colabDoc]);

  if (colabDoc == null) {
    return <div>Loading document...</div>;
  } else {
    return (
      <>
        <ColabDocEditorProvider>
          <EditorWrapper>
            <EditorHeaderWrapper>
              <EditorTopHeaderWrapper>
                <EditorTopHeaderLeftStack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ColabriSvgIcon expanded={false} />
                    <Typography variant="h6" component="div">
                      {colabDoc.name}
                    </Typography>
                    <DocumentTypeLabel>Statement</DocumentTypeLabel>
                    {contentTypeRef.current && (
                      <DocumentTypeLabel>
                        {contentTypeRef.current?.name}
                      </DocumentTypeLabel>
                    )}
                  </Stack>
                </EditorTopHeaderLeftStack>
                <EditorTopHeaderRightStack>
                  <Button variant="outlined" startIcon={<ShareIcon />}>
                    Share
                  </Button>
                  <ThemeSwitcher />
                  <ProfileMenu />
                </EditorTopHeaderRightStack>
              </EditorTopHeaderWrapper>
              <EditorToolbarWrapper>
                <ToolbarMenu />
              </EditorToolbarWrapper>
            </EditorHeaderWrapper>
            <EditorContentWrapper>
              <EditorContentLeftColumn></EditorContentLeftColumn>

              {/* Main Editor Area */}
              <EditorContentMainColumn>
                <StatementBlock bp={{}} />
              </EditorContentMainColumn>
              <EditorContentRightColumn></EditorContentRightColumn>
            </EditorContentWrapper>
          </EditorWrapper>
        </ColabDocEditorProvider>
      </>
    );
  }
}
