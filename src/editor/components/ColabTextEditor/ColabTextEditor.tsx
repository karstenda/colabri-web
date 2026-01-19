import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import { statementTextSchema } from './schemas/StatementTextSchema';
import { simpleTextSchema } from './schemas/SimpleTextSchema';
import './editor.css';
import ColabEphemeralStoreManager from '../ColabDocEditor/EphemeralStoreManager';
import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import {
  useSetActiveToolbar,
  useSetToolbarSetup,
} from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { createFormattingSetup } from '../ToolbarMenu/FormattingMenuSetup';
import { useColorScheme } from '../../../ui/hooks/useColorScheme/useColorScheme';
import FocusPlugin from './plugins/focus/FocusPlugin';
import SpellCheckPlugin from './plugins/spellcheck/SpellCheckPlugin';
import {
  SpellCheckSuggestionBox,
  SpellCheckSuggestionBoxProps,
} from './plugins/spellcheck/SpellCheckSuggestionBox';
import { Schema } from 'prosemirror-model';

export type ColabTextEditorProps = {
  loro: LoroDocType;
  ephStoreMgr: ColabEphemeralStoreManager;
  containerId: ContainerID;
  spellCheck: {
    enabled: boolean;
    supported: boolean;
    orgId: string;
    langCode?: string;
  };
  schema?: 'simple' | 'statement';
  canEdit?: boolean;
  txtDir?: 'ltr' | 'rtl';
  customFonts?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
};

export type ColabTextEditorHandle = {
  view: EditorView | null;
};

const ColabTextEditor = forwardRef<ColabTextEditorHandle, ColabTextEditorProps>(
  (
    {
      loro,
      ephStoreMgr,
      containerId,
      spellCheck,
      schema = 'statement',
      canEdit = true,
      txtDir = 'ltr',
      customFonts,
      onFocus,
      onBlur,
    }: ColabTextEditorProps,
    ref,
  ) => {
    // Get the color scheme
    const { mode } = useColorScheme();

    const [spellCheckSuggestionBox, setSpellCheckSuggestionBox] =
      useState<SpellCheckSuggestionBoxProps | null>(null);

    // Generate a unique editor ID based on the container ID
    const editorId = 'editor:' + containerId;

    // Reference to the editor view
    const editorRef = useRef<null | EditorView>(null);

    useImperativeHandle(ref, () => ({
      get view() {
        return editorRef.current;
      },
    }));

    // Select the proper schema
    let mySchema: Schema;
    if (schema === 'simple') {
      mySchema = simpleTextSchema;
    } else if (schema === 'statement') {
      mySchema = statementTextSchema;
    } else {
      throw new Error(`Unsupported schema type: ${schema}`);
    }

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

    // Reference to the user presence cache
    const userPresenceCache = useRef<Record<string, any>>({});

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
      if (spellCheck.enabled && spellCheck.supported) {
        allPlugins.push(
          SpellCheckPlugin({
            orgId: spellCheck.orgId,
            langCode: spellCheck.langCode,
            setSuggestionBox: setSpellCheckSuggestionBox,
          }),
        );
      }

      // Generate the custom editor attributes
      const attributes = {};
      // Check if we need a text direction attribute
      if (txtDir === 'rtl') {
        Object.assign(attributes, { dir: 'rtl' });
      }
      // Check if we need a custom font families
      if (customFonts && customFonts.length > 0) {
        Object.assign(attributes, {
          style: `font-family: ${customFonts.join(', ')};`,
        });
      }
      // Wether we need to enable the browsers default spell checking
      if (spellCheck.enabled) {
        if (spellCheck.supported) {
          Object.assign(attributes, { spellcheck: 'false' });
        } else {
          Object.assign(attributes, { spellcheck: 'true' });
        }
      }

      // Initialize the editor view
      const editorView = new EditorView(editorDom.current, {
        state: EditorState.create({ schema: mySchema, plugins: allPlugins }),
        editable: () => canEdit,
        attributes: attributes,
      });
      editorRef.current = editorView;

      // Set the toolbar setup in the global state
      setToolbarSetup(editorId, toolbarSetup);

      // Cleanup function on unmount
      return () => {
        unBindEphCursorStore();
      };
    }, [ephStoreMgr, containerId]);

    // Update the editable state when canEdit changes
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.setProps({
          editable: () => canEdit,
        });
      }
    }, [canEdit]);

    // Function to create the cursor DOM element
    const createCursor = (peerId: string) => {
      let userPresence = ephStoreMgr.getUserPresence(peerId);
      if (!userPresence) {
        if (userPresenceCache.current[peerId]) {
          userPresence = userPresenceCache.current[peerId];
        } else {
          userPresence = {
            name: peerId,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            id: '',
          };
        }
      } else {
        userPresenceCache.current[peerId] = userPresence;
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

    return (
      <>
        <div id={'editor'} className={className} ref={editorDom} />
        {spellCheckSuggestionBox && (
          <SpellCheckSuggestionBox
            {...spellCheckSuggestionBox}
            readOnly={!canEdit}
          />
        )}
      </>
    );
  },
);

export default ColabTextEditor;
