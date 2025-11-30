import { createContext } from 'react';
import { FormattingSetup } from './FormattingMenuSetup';
import { EditorView } from 'prosemirror-view';

export type ToolbarSetups = Record<string, ToolbarSetup>;

export type ToolbarSetup = {
  id: string;
  formatting: FormattingSetup;
};

export type ToolbarMenuContextType = {
  activeToolbarId: string | null;
  setActiveToolbarId: React.Dispatch<React.SetStateAction<string | null>>;
  activeEditorView: EditorView | null;
  setActiveEditorView: React.Dispatch<React.SetStateAction<EditorView | null>>;
  toolbarSetups: ToolbarSetups;
  setToolbarSetups: React.Dispatch<React.SetStateAction<ToolbarSetups>>;
};

const ToolbarMenuContext = createContext<ToolbarMenuContextType | null>(null);

export default ToolbarMenuContext;
