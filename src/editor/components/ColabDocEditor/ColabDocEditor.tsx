import { useEffect, useRef, useState } from 'react';
import ColabTextEditor from '../ColabTextEditor/ColabTextEditor';
import { useColabDoc } from './ColabDocProvider';
import { ContainerID, LoroDoc, LoroMap } from 'loro-crdt';
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
} from './ColabDocEditorStyles';
import Paper from '@mui/material/Paper';
import ColabriSvgIcon from '../../../ui/components/MainLayout/icons/ColabriSvgIcon';
import ShareIcon from '@mui/icons-material/Share';
import ProfileMenu from '../../../ui/components/ProfileMenu/ProfileMenu';
import ThemeSwitcher from '../../../ui/components/ThemeSwitcher/ThemeSwitcher';
import { Button, Typography } from '@mui/material';
import ToolbarMenuProvider from './ToolbarMenu/ToolbarMenuProvider';
import ToolbarMenu from './ToolbarMenu/ToolbarMenu';

export default function ColabDocEditor() {
  // Get the ColabDoc context
  const { colabDoc } = useColabDoc();
  // Local state
  const [editorVersion, setEditorVersion] = useState('');
  // Reference to the LoroDoc
  const loroDocRef = useRef<LoroDocType | null>(null);
  const ephStoreMgrRef = useRef<ColabEphemeralStoreManager | null>(null);

  // Temporary reference to the container we just want to render for now
  const loroContainerRef = useRef<ContainerID | null>(null);

  // Initialize version display and set up subscription
  useEffect(() => {
    // Make sure we have the loroDoc and update function
    if (!colabDoc) {
      return;
    }

    // For now, just target english 'en' content
    const loroDoc = colabDoc.loroDoc;
    const contentLoroMap = loroDoc.getMap('content');
    const enStatementBlock = contentLoroMap.getOrCreateContainer(
      'en',
      new LoroMap(),
    );
    const enTextElement = enStatementBlock.getOrCreateContainer(
      'textElement',
      new LoroMap(),
    );
    enTextElement.set('nodeName', 'doc');

    // Store the correct references
    loroDocRef.current = loroDoc as LoroDocType;
    ephStoreMgrRef.current = colabDoc.ephStoreMgr;
    loroContainerRef.current = enTextElement.id;

    // Initial version update
    updateEditorVersion(loroDoc);

    // Listen for changes in the LoroDoc
    const unsubscribe = loroDoc.subscribe(() => {
      // Update the version display
      updateEditorVersion(loroDoc);
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [colabDoc]);

  // Update the editor version display
  function updateEditorVersion(loroDoc: LoroDoc) {
    Promise.resolve().then(() => {
      const version = loroDoc.version();
      const map = version.toJSON();
      const versionObj: Record<string, any> = {};
      for (const [key, value] of map) {
        versionObj[key.toString()] = value;
      }
      const versionStr = JSON.stringify(versionObj, null, 2);
      setEditorVersion(versionStr);
    });
  }

  if (colabDoc == null) {
    return <div>Loading document...</div>;
  } else {
    return (
      <>
        <ToolbarMenuProvider>
          <EditorWrapper>
            <EditorHeaderWrapper>
              <EditorTopHeaderWrapper>
                <EditorTopHeaderLeftStack>
                  <ColabriSvgIcon expanded={false} />
                  <Typography variant="h6" component="div">
                    {colabDoc.name}
                  </Typography>
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
                <Paper>
                  <div className="editor">
                    <span>Version: {editorVersion}</span>

                    {loroDocRef.current !== null &&
                      loroContainerRef.current !== null &&
                      ephStoreMgrRef.current !== null && (
                        <ColabTextEditor
                          loro={loroDocRef.current}
                          ephStoreMgr={ephStoreMgrRef.current}
                          containerId={loroContainerRef.current}
                        />
                      )}
                  </div>
                </Paper>
              </EditorContentMainColumn>
              <EditorContentRightColumn></EditorContentRightColumn>
            </EditorContentWrapper>
          </EditorWrapper>
        </ToolbarMenuProvider>
      </>
    );
  }
}
