import { createContext } from 'react';
import { EditorView } from 'prosemirror-view';
import { FormattingSetup } from '../../components/ToolbarMenu/FormattingMenuSetup';
import { ContainerID, LoroDoc } from 'loro-crdt';

export type ToolbarSetups = Record<string, ToolbarSetup>;

export type ToolbarSetup = {
  id: string;
  formatting: FormattingSetup;
};

export type ActiveBlockRef = {
  id: string;
  blockType: string;
  loroContainerId?: ContainerID;
  loroDoc?: LoroDoc;
};

export type ColabDocEditorContextType = {
  // The active toolbar ID
  activeToolbarId: string | null;
  setActiveToolbarId: React.Dispatch<React.SetStateAction<string | null>>;
  // The active editor view
  activeEditorView: EditorView | null;
  setActiveEditorView: React.Dispatch<React.SetStateAction<EditorView | null>>;
  // The active block ID
  activeBlock: ActiveBlockRef | null;
  setActiveBlock: React.Dispatch<React.SetStateAction<ActiveBlockRef | null>>;
  // All toolbar setups
  toolbarSetups: ToolbarSetups;
  setToolbarSetups: React.Dispatch<React.SetStateAction<ToolbarSetups>>;
};

const ColabDocEditorContext = createContext<ColabDocEditorContextType | null>(
  null,
);

export default ColabDocEditorContext;
