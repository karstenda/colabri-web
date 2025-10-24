
import { useEffect, useState, useRef } from "react";
import { ColabDoc } from "../../data/ColabDoc";
import ColabTextEditor from "../ColabTextEditor/ColabTextEditor";

export type ColabDocEditorProps = {
    colabDoc: ColabDoc;
}

export default function ColabDocEditor(props: ColabDocEditorProps) {

    const { colabDoc } = props;

    // Extract the loroDoc
    const loroDoc = colabDoc.loroDoc;
    const loroText = loroDoc.getText("text");
    updateEditorVersion();

    // Local state
    const [editorVersion, setEditorVersion] = useState("");

    // Create a broadcast channel to sync between tabs
    useEffect(() => {

        // Create the broadcast channel to send and receive messages between tabs.
        const bc = new BroadcastChannel("colabri-sync");

        // Listen for changes in the LoroDoc
        loroDoc.subscribe((e) => {
            // If the change is made to this editor
            if (e.by === "local") {
                Promise.resolve().then(() => {
                    // Broadcast it
                    sendChange(bc);
                });
            }
            // Update the version display
            updateEditorVersion();
        });

        // Receive message
        bc.onmessage = (evt) => {
            receiveChange(evt);
        };

        // Cleanup on unmount
        return () => {
            bc.close();
        }

    }, []);

    // This function sends the change event to other open tabs/windows
    function sendChange(bc: BroadcastChannel) {
        
        // Generate all the missing operations
        const missingOps = loroDoc.export({
            mode: "update",
            //from: loroDoc.oplogVersion(),
        });
        
        // Send them via broadcast channel
        bc.postMessage({
            type: "sync",
            payload: missingOps
        });
    }

    // Receive the change event from other tabs/windows
    function receiveChange(msg: MessageEvent<any>) {
        const { type, payload } = msg.data;
        if (type === "sync") {
            loroDoc.import(payload as Uint8Array<ArrayBufferLike>);
        }
    }

    // Update the editor version display
    function updateEditorVersion() {
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

    return (
        <div className="editor">
            <span>Version: {editorVersion}</span>
            <ColabTextEditor loroDoc={loroDoc} loroText={loroText} />
        </div>
    );

}