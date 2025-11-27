import { useEffect, useRef, useState } from 'react';
import ColabTextEditor from '../ColabTextEditor2/ColabTextEditor2';
import { useColabDoc } from './ColabDocProvider';
import { ContainerID, LoroDoc, LoroMap } from 'loro-crdt';
import { LoroDocType } from 'loro-prosemirror';

export type ColabDocEditorProps = {};

export default function ColabDocEditor(props: ColabDocEditorProps) {
  // Get the ColabDoc context
  const { colabDoc } = useColabDoc();
  // Local state
  const [editorVersion, setEditorVersion] = useState('');
  // Reference to the LoroDoc
  const loroDocRef = useRef<LoroDocType | null>(null);
  const loroContainerRef = useRef<ContainerID | null>(null);

  // Initialize version display and set up subscription
  useEffect(() => {
    // Make sure we have the loroDoc and update function
    if (!colabDoc) {
      return;
    }

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

    // Store the LoroDoc reference
    loroDocRef.current = loroDoc as LoroDocType;
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
    // Extract the loroDoc
    //const loroDoc = colabDoc.loroDoc;
    //const loroText = loroDoc.getText('text');

    return (
      <div className="editor">
        <span>Version: {editorVersion}</span>

        {loroDocRef.current !== null && loroContainerRef.current !== null && (
          <ColabTextEditor
            loro={loroDocRef.current}
            containerId={loroContainerRef.current}
          />
        )}
      </div>
    );
  }
}
