
import { useEffect, useState } from "react";
import ColabTextEditor from "../ColabTextEditor/ColabTextEditor";
import { useColabDoc } from "./ColabDocProvider";
import { LoroDoc } from "loro-crdt/base64";


export type ColabDocEditorProps = {
    
}

export default function ColabDocEditor(props: ColabDocEditorProps) {

    // Get the ColabDoc context
    const { colabDoc, updateColabDoc } = useColabDoc();
    // Local state
    const [editorVersion, setEditorVersion] = useState("");

    // Initialize version display and set up subscription
    useEffect(() => {

        // Make sure we have the loroDoc and update function
        const loroDoc = colabDoc?.loroDoc;
        if (!loroDoc || !updateColabDoc) {
            return;
        }

        // Initial version update
        updateEditorVersion(loroDoc);

        // Listen for changes in the LoroDoc
        const unsubscribe = loroDoc.subscribe((e) => {
            // If the change is made to this editor
            if (e.by === "local") {
                Promise.resolve().then(() => {
                    
                    // Generate all the missing operations
                    const delta = loroDoc.export({
                        mode: "update",
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
        return <div>Loading document...</div>
    } else {

        // Extract the loroDoc
        const loroDoc = colabDoc.loroDoc;
        const loroText = loroDoc.getText("text");

        return <div className="editor">
            <span>Version: {editorVersion}</span>
            <ColabTextEditor loroDoc={loroDoc} loroText={loroText} />
        </div>
    }
}