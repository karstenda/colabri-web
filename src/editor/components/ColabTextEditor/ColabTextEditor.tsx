import { useEffect, useState, useRef } from "react";
import { LoroText } from "loro-crdt/base64";
import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import "quill/dist/quill.snow.css";
import { QuillBinding } from "../QuillEditor/binding";
import { LoroDoc } from "loro-crdt";

export type ColabTextEditorProps = {
    loroDoc: LoroDoc
    loroText: LoroText;
}

export default function ColabTextEditor(props: ColabTextEditorProps) {

    const { loroDoc, loroText } = props;
        
    // Prepare the elements needed to rendere
    const editorRef = useRef<HTMLDivElement>(null);
        
    // Initialize the editor
    useEffect(() => {

        // Create a Quill editor
        const quill = new Quill(editorRef.current!, {
            modules: {
                toolbar: [
                    [{
                        header: [1, 2, 3, 4, false]
                    }],
                    ["bold", "italic", "underline", "link"],
                ],
            },
            //theme: 'bubble',
            theme: "bubble",
            formats: ["bold", "underline", "header", "italic", "link"],
            placeholder: "Type something in here!",
        });

        // Bind the LoroText to the Quill editor
        const binding = new QuillBinding(loroDoc, loroText, quill);

        // Nicely cleanup on unmount
        return () => {
            binding.destroy();
        }
    }, []);

    return (<>
        <div ref={editorRef} />
    </>);
}
