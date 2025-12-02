import { useEffect, useRef } from 'react';
import {
  CursorEphemeralStore,
  LoroEphemeralCursorPlugin,
  LoroDocType,
  LoroSyncPlugin,
  LoroUndoPlugin,
  redo,
  undo,
} from 'loro-prosemirror';
import { ContainerID } from 'loro-crdt';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { DOMParser } from 'prosemirror-model';
import { statementTextSchema } from './StatementTextSchema';
import './editor.css';
import ColabEphemeralStoreManager from '../ColabDocEditor/EphemeralStoreManager';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import {
  useSetActiveToolbar,
  useSetToolbarSetup,
} from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { createFormattingSetup } from '../ToolbarMenu/FormattingMenuSetup';
import { useColorScheme } from '@mui/material/styles';
import FocusPlugin from './plugins/FocusPlugin';

// Load the document according to the statement text schema
const mySchema = statementTextSchema;
const doc = DOMParser.fromSchema(mySchema).parse(document.createElement('div'));

export type ColabTextEditorProps = {
  loro: LoroDocType;
  ephStoreMgr: ColabEphemeralStoreManager;
  containerId: ContainerID;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function ColabTextEditor({
  loro,
  ephStoreMgr,
  containerId,
  onFocus,
  onBlur,
}: ColabTextEditorProps) {
  // Get the color scheme
  const { mode } = useColorScheme();

  // Generate a unique editor ID based on the container ID
  const editorId = 'editor:' + containerId;

  // Reference to the editor view
  const editorRef = useRef<null | EditorView>(null);

  // Reference to the DOM node that will contain the editor
  const editorDom = useRef(null);

  // Function to set the toolbar menu state
  const setToolbarSetup = useSetToolbarSetup();

  // Function to set the active toolbar ID
  const setActiveToolbar = useSetActiveToolbar();

  // Reference to the Loro document
  const loroRef = useRef(loro);
  if (loroRef.current && loro && loroRef.current !== loro) {
    throw new Error('loro ref cannot be changed');
  }

  // Reference to the ephemeral cursor store
  const ephemeralCursorStoreRef = useRef<CursorEphemeralStore>(
    new CursorEphemeralStore(loro.peerIdStr),
  );

  // Define the toolbar setup for this editor
  const toolbarSetup = {
    id: editorId,
    formatting: { ...createFormattingSetup(mySchema) },
  };

  // Define what to do on editor focus
  const onEditorFocus = () => {
    setActiveToolbar(editorId, editorRef.current);
    if (onFocus) {
      onFocus();
    }
  };

  // Define what to do on editor blur
  const onEditorBlur = () => {
    setActiveToolbar(null, null);
    if (onBlur) {
      onBlur();
    }
  };

  // Initialize the editor on component mount!
  useEffect(() => {
    // If we already initialized the editor, do nothing
    if (editorRef.current) {
      return;
    }

    // Bind the cursor store to the ephemeral store manager
    const unBindEphCursorStore = ephStoreMgr.bindCursorStore(
      containerId,
      ephemeralCursorStoreRef.current,
    );

    // Build the list of plugins for the editor
    const allPlugins = [
      LoroSyncPlugin({ doc: loroRef.current!, containerId }),
      LoroUndoPlugin({ doc: loroRef.current! }),
      LoroEphemeralCursorPlugin(ephemeralCursorStoreRef.current, {
        createCursor: createCursor,
      }),
      ToolbarPlugin({
        toolbarId: editorId,
        toolbarSetup,
        setToolbarSetup,
        setActiveToolbar,
      }),
      FocusPlugin({
        onFocus: onEditorFocus,
        onBlur: onEditorBlur,
      }),
      keymap({
        'Mod-z': (state) => undo(state, () => {}),
        'Mod-y': (state) => redo(state, () => {}),
        'Mod-Shift-z': (state) => redo(state, () => {}),
      }),
      keymap(baseKeymap),
    ];

    // Initialize the editor view
    const editorView = new EditorView(editorDom.current, {
      state: EditorState.create({ doc, schema: mySchema, plugins: allPlugins }),
    });
    editorRef.current = editorView;

    // Set the toolbar setup in the global state
    setToolbarSetup(editorId, toolbarSetup);

    // Cleanup function on unmount
    return () => {
      unBindEphCursorStore();
    };
  }, [ephStoreMgr, containerId]);

  // Function to create the cursor DOM element
  const createCursor = (peerId: string) => {
    let userPresence = ephStoreMgr.getUserPresence(peerId);
    if (!userPresence) {
      userPresence = {
        name: peerId,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        id: '',
      };
    }
    const cursor = document.createElement('span');
    cursor.classList.add('ProseMirror-loro-cursor');
    cursor.setAttribute('style', `border-color: ${userPresence.color}`);
    const userDiv = document.createElement('div');
    userDiv.setAttribute('style', `background-color: ${userPresence.color}`);
    userDiv.insertBefore(document.createTextNode(userPresence.name), null);
    const nonbreakingSpace1 = document.createTextNode('\u2060');
    const nonbreakingSpace2 = document.createTextNode('\u2060');
    cursor.insertBefore(nonbreakingSpace1, null);
    cursor.insertBefore(userDiv, null);
    cursor.insertBefore(nonbreakingSpace2, null);
    return cursor;
  };

  // Get the color scheme and generate the class name
  let className = 'ColabTextEditor';
  if (mode === 'dark') {
    className += ' dark';
  }

  return <div id={'editor'} className={className} ref={editorDom} />;
}
