import { useEffect, useState, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import "quill/dist/quill.snow.css";
import { QuillBinding } from "../QuillEditor/binding";
import { LoroDoc } from "loro-crdt/base64";

export default function TestBench() {

    const editor1Ref = useRef<HTMLDivElement>(null);
    const editor2Ref = useRef<HTMLDivElement>(null);
    const editor3Ref = useRef<HTMLDivElement>(null);
    const editor4Ref = useRef<HTMLDivElement>(null);

    const binds: QuillBinding[] = [];
    const texts: LoroDoc[] = [];
    const editors = [editor1Ref, editor2Ref, editor3Ref, editor4Ref];

    const [editorVersions, setEditorVersions] = useState(["", "", "", ""]);
    const [online, setOnline] = useState([true, true, true, true]);

    const onlineRef = useRef(online);
    useEffect(() => {
        onlineRef.current = online;
    }, [online]);

    useEffect(() => {

        let index = 0;

        for (const editor of editors) {

            const text = new LoroDoc();
            text.setPeerId(BigInt(index));
            texts.push(text);

            const idx = index;

            // Create a Quill editor
            const quill = new Quill(editor.current!, {
                modules: {
                    toolbar: [
                        [{
                            header: [1, 2, 3, 4, false]
                        }],
                        ["bold", "italic", "underline", "link"],
                    ],
                },
                //theme: 'bubble',
                theme: "snow",
                formats: ["bold", "underline", "header", "italic", "link"],
                placeholder: "Type something in here!",
            });

            // Bind the LoroText to the Quill editor
            binds.push(new QuillBinding(text, text.getText("text"), quill));

            // Listen for changes in the LoroText
            text.subscribe((e) => {
                // If the change is made to this editor, sync with the others
                if (e.by === "local") {
                    Promise.resolve().then(() => {
                        syncEditor(idx);
                    });
                }
                // Always update the editor version string
                Promise.resolve().then(() => {
                    const version = text.version();
                    const map = version.toJSON();
                    const versionObj: Record<string, any> = {};
                    for (const [key, value] of map) {
                        versionObj[key.toString()] = value;
                    }
                    const versionStr = JSON.stringify(versionObj, null, 2);
                    editorVersions[idx] = versionStr;
                    setEditorVersions([...editorVersions]);
                });
            });

            index += 1;
        }

        // On unmount ...
        return () => {
            // Destroy all bindings
            binds.forEach((x) => x.destroy());
        };

    }, []);

    // Toggle online/offline status of the specified editor
    const toggleOnline = (index: number) => {
        const newOnline = [...online];
        newOnline[index] = !newOnline[index];
        setOnline(newOnline);
        onlineRef.current = newOnline;
        if (newOnline[index]) {
            syncEditor(index);
        }
    };

    // Sync the specified editor with all the others
    const syncEditor = (index: number) => {

        const text = texts[index];

        // If this editor is offline, do nothing
        if (!onlineRef.current[index]) {
            return;
        }
        // Iterate over the editors
        for (let i = 0; i < texts.length; i++) {
            // Skip itself and offline editors
            if (i === index || !onlineRef.current[i]) {
                continue;
            }
            // Push the changes of text to the other editor
            texts[i].import(text.export({mode: "update", from: texts[i].version()}))
            // Push any changes from the other editor to this editor
            text.import(texts[i].export({mode: "update", from: text.version()}));
        }
    };

  return (
    <>
        <h2>
            <a href="https://github.com/loro-dev/crdt-richtext">
            Loro crdt-richtext
            </a>
        </h2>

        <div className="parent">
            <div className="editor">
                <button onClick={() => {toggleOnline(0);}}>
                    Editor 0 - {online[0]? "online" : "offline"}
                </button>
                <div className="version">version: {editorVersions[0]}</div>
                <div ref={editor1Ref} />
            </div>
            <div className="editor">
                <button onClick={() => {toggleOnline(1);}}>
                    Editor 1 - {online[1]? "online" : "offline"}
                </button>
                <div className="version">version: {editorVersions[1]}</div>
                <div ref={editor2Ref} />
            </div>
            <div className="editor">
                <button onClick={() => {toggleOnline(2);}}>
                    Editor 2 - {online[2]? "online" : "offline"}
                </button>
                <div className="version">version: {editorVersions[2]}</div>
                <div ref={editor3Ref} />
            </div>
            <div className="editor">
                <button onClick={() => {toggleOnline(3);}}>
                    Editor 3 - {online[3]? "online" : "offline"}
                </button>
                <div className="version">version: {editorVersions[3]}</div>
                <div ref={editor4Ref} />
            </div>
        </div>
    </>
  );
}