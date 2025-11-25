import { useEffect, useRef, useState } from 'react';
import ColabTextEditor from '../ColabTextEditor2/ColabTextEditor2';
import { useColabDoc } from './ColabDocProvider';
import { ContainerID, LoroDoc, LoroList, LoroMap, LoroText } from 'loro-crdt';
import { LoroDocType, LoroNodeContainerType } from 'loro-prosemirror';

export type ColabDocEditorProps = {};

export default function ColabDocEditor(props: ColabDocEditorProps) {
  // Get the ColabDoc context
  const { colabDoc, updateColabDoc } = useColabDoc();
  // Local state
  const [editorVersion, setEditorVersion] = useState('');
  // Reference to the LoroDoc
  const loroDocRef = useRef<LoroDocType | null>(null);
  const loroContainerRef = useRef<ContainerID | null>(null);

  // Initialize version display and set up subscription
  useEffect(() => {
    // Make sure we have the loroDoc and update function
    //const loroDoc = colabDoc?.loroDoc;
    if (!colabDoc || !updateColabDoc) {
      return;
    }

    const loroDoc = new LoroDoc<{
      doc: LoroMap<LoroNodeContainerType>;
      data: LoroMap;
    }>();
    const loroDataMap = loroDoc.getMap('data');
    const loroDocMap = loroDoc.getMap('doc');

    // Store the LoroDoc reference
    loroDocRef.current = loroDoc;
    loroContainerRef.current = loroDocMap.id;
    // Initial version update
    updateEditorVersion(loroDoc);

    // Listen for changes in the LoroDoc
    const unsubscribe = loroDoc.subscribe((e) => {
      // If the change is made to this editor
      if (e.by === 'local') {
        Promise.resolve().then(() => {
          // Generate all the missing operations
          const delta = loroDoc.export({
            mode: 'update',
            //from: loroDoc.oplogVersion(),
          });

          // Broadcast the change
          updateColabDoc(delta);
        });
      }
      // Update the version display
      updateEditorVersion(loroDoc);
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [colabDoc, updateColabDoc]);

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
