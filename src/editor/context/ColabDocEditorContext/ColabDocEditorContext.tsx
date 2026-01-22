import { createContext } from 'react';
import { EditorView } from 'prosemirror-view';
import { FormattingSetup } from '../../components/ToolbarMenu/FormattingMenuSetup';
import { ContainerID, LoroDoc } from 'loro-crdt';
import {
  ConnectedColabDoc,
  ConnectedSheetDoc,
  ConnectedStmtDoc,
} from '../../data/ConnectedColabDoc';

export type ToolbarSetups = Record<string, ToolbarSetup>;

export type ToolbarSetup = {
  id: string;
  formatting: FormattingSetup;
};

export type ActiveBlockRef = {
  id: string;
  blockType: string;
  loroContainerId?: ContainerID;
  colabDoc: ConnectedStmtDoc | ConnectedSheetDoc;
};

export type ActiveStatementElementRef = {
  stmtContainerId?: ContainerID;
  langCode: string;
  colabDoc: ConnectedStmtDoc | ConnectedSheetDoc;
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
  // The active statement element
  activeStatementElement: ActiveStatementElementRef | null;
  setActiveStatementElement: React.Dispatch<
    React.SetStateAction<ActiveStatementElementRef | null>
  >;
  // All toolbar setups
  toolbarSetups: ToolbarSetups;
  setToolbarSetups: React.Dispatch<React.SetStateAction<ToolbarSetups>>;
};

const ColabDocEditorContext = createContext<ColabDocEditorContextType | null>(
  null,
);

export default ColabDocEditorContext;
