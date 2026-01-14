import { useEffect, useRef, useState } from 'react';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { LoroMap } from 'loro-crdt';
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
  EditorContentBlockTrack,
  DocNameHeader,
} from './ColabDocEditorStyles';
import ColabriSvgIcon from '../../../ui/components/MainLayout/icons/ColabriSvgIcon';
import ProfileMenu from '../../../ui/components/ProfileMenu/ProfileMenu';
import ThemeSwitcher from '../../../ui/components/ThemeSwitcher/ThemeSwitcher';
import { Box, CircularProgress, Stack, useMediaQuery } from '@mui/material';
import ColabDocEditorProvider from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import ToolbarMenu from '../ToolbarMenu/ToolbarMenu';
import StatementBlock from '../blocks/StatementBlock/StatementBlock';
import { useContentTypes } from '../../../ui/hooks/useTemplates/useTemplates';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ContentType, DocumentType } from '../../../api/ColabriAPI';
import { ColabLoroDoc } from '../../data/ColabDoc';
import ManageDocButton from '../ManageDocButton/ManageDocButton';
import { useTranslation } from 'react-i18next';

export default function ColabDocEditor() {
  // Get the translation hook
  const { t } = useTranslation();

  // Get the ColabDoc context
  const { colabDoc } = useColabDoc();

  // Get the organization
  const organization = useOrganization();

  // Get the viewport size
  const compactView = useMediaQuery('(max-width:800px)');

  // Get the content types
  const { contentTypes } = useContentTypes(
    organization?.id || '',
    organization != null,
  );

  // Reference to the LoroDoc
  const loroDocRef = useRef<ColabLoroDoc | null>(null);
  const ephStoreMgrRef = useRef<ColabEphemeralStoreManager | null>(null);

  // Reference to the content type
  const contentTypeRef = useRef<ContentType | null>(null);

  // State to track whether the user can manage the document
  const [canManage, setCanManage] = useState<boolean>(false);

  // Initialize version display and set up subscription
  useEffect(() => {
    // Make sure we have the loroDoc and update function
    if (!colabDoc) {
      return;
    }

    // Get the loroDoc
    const loroDoc = colabDoc.getLoroDoc();
    const controller = colabDoc.getDocController();

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
    loroDocRef.current = loroDoc;
    ephStoreMgrRef.current = colabDoc.getEphStoreMgr();

    // Initial check if the user can manage the document
    setCanManage(controller.hasManagePermission());

    // Listen for ACL changes in the LoroDoc
    return controller.subscribeToDocAclChanges(() => {
      // Check if the user can manage the document
      setCanManage(controller.hasManagePermission());
    });
  }, [colabDoc]);

  if (colabDoc == null) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
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
                    {!compactView && (
                      <DocNameHeader variant="h6">
                        {colabDoc.getDocName()}
                      </DocNameHeader>
                    )}
                    {!compactView && (
                      <DocumentTypeLabel>
                        {colabDoc?.getDocType() ===
                          DocumentType.DocumentTypeColabStatement && (
                          <>{t('statements.type')}</>
                        )}
                        {colabDoc?.getDocType() ===
                          DocumentType.DocumentTypeColabSheet && (
                          <>{t('sheets.type')}</>
                        )}
                      </DocumentTypeLabel>
                    )}
                    {contentTypeRef.current && (
                      <DocumentTypeLabel>
                        {contentTypeRef.current?.name}
                      </DocumentTypeLabel>
                    )}
                  </Stack>
                </EditorTopHeaderLeftStack>
                <EditorTopHeaderRightStack>
                  {canManage && <ManageDocButton />}
                  {!compactView && <ThemeSwitcher />}
                  <ProfileMenu />
                </EditorTopHeaderRightStack>
              </EditorTopHeaderWrapper>
              <EditorToolbarWrapper>
                <ToolbarMenu docType={colabDoc?.getDocType()} />
              </EditorToolbarWrapper>
            </EditorHeaderWrapper>
            <EditorContentWrapper>
              <EditorContentLeftColumn></EditorContentLeftColumn>

              {/* Main Editor Area */}
              <EditorContentMainColumn>
                <EditorContentBlockTrack>
                  {colabDoc?.getDocType() ===
                    DocumentType.DocumentTypeColabStatement && (
                    <StatementBlock bp={{}} />
                  )}
                  {colabDoc?.getDocType() ===
                    DocumentType.DocumentTypeColabSheet && <>TODO</>}
                </EditorContentBlockTrack>
              </EditorContentMainColumn>
              <EditorContentRightColumn></EditorContentRightColumn>
            </EditorContentWrapper>
          </EditorWrapper>
        </ColabDocEditorProvider>
      </>
    );
  }
}
