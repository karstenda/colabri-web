import React, { ReactNode } from 'react';
import ColabDocEditorContext, {
  ActiveBlockRef,
  ActiveStatementElementRef,
  ToolbarSetup,
} from './ColabDocEditorContext';
import { EditorView } from 'prosemirror-view';
import { ToolbarSetups } from '../../components/ToolbarMenu/ToolbarSetup';

export function useToolbarContext() {
  const context = React.useContext(ColabDocEditorContext);
  if (!context) {
    throw new Error(
      'useToolbarSetup must be used within ColabDocEditorProvider',
    );
  }
  return context;
}

export function useToolbarSetup(toolbarId: string) {
  const context = useToolbarContext();
  return context.toolbarSetups[toolbarId];
}

export function useSetToolbarSetup() {
  const context = useToolbarContext();
  return (toolbarId: string, setup: ToolbarSetup | undefined) => {
    // If setup is undefined, remove the toolbar setup
    if (!setup) {
      context.setToolbarSetups((prevSetups) => {
        const newSetups = { ...prevSetups };
        delete newSetups[toolbarId];
        return newSetups;
      });
    }
    // Update or add the toolbar setup
    else {
      context.setToolbarSetups((prevSetups) => ({
        ...prevSetups,
        [toolbarId]: setup,
      }));
    }
  };
}

export function useSetActiveToolbar() {
  const context = useToolbarContext();
  return (toolbarId: string | null, editorView: EditorView | null) => {
    context.setActiveToolbarId(toolbarId);
    context.setActiveEditorView(editorView);
  };
}

export function useActiveToolbarId() {
  const context = useToolbarContext();
  return context.activeToolbarId;
}

export function useActiveEditorView() {
  const context = useToolbarContext();
  return context.activeEditorView;
}

export function useActiveToolbarSetup() {
  const context = useToolbarContext();
  const activeToolbarId = useActiveToolbarId();
  if (activeToolbarId) {
    return context.toolbarSetups[activeToolbarId];
  } else {
    return null;
  }
}

export function useActiveBlock() {
  const context = useToolbarContext();
  return context.activeBlock;
}

export function useSetActiveBlock() {
  const context = useToolbarContext();
  return context.setActiveBlock;
}

export function useActiveStatementElement() {
  const context = useToolbarContext();
  return context.activeStatementElement;
}

export function useSetActiveStatementElement() {
  const context = useToolbarContext();
  return context.setActiveStatementElement;
}

type ColabDocEditorProviderProps = {
  children: ReactNode;
};

export default function ColabDocEditorProvider({
  children,
}: ColabDocEditorProviderProps) {
  // Initialize the state that will keep track of the active toolbar ID
  const [activeToolbarId, setActiveToolbarId] = React.useState<string | null>(
    null,
  );

  // The currently active editor view
  const [activeEditorView, setActiveEditorView] =
    React.useState<EditorView | null>(null);

  // The currently active block ID
  const [activeBlock, setActiveBlock] = React.useState<ActiveBlockRef | null>(
    null,
  );

  // The currently active statement element
  const [activeStatementElement, setActiveStatementElement] =
    React.useState<ActiveStatementElementRef | null>(null);

  // Intialize the state that will keep track of toolbar setups
  const [toolbarSetups, setToolbarSetups] = React.useState<ToolbarSetups>({});

  return (
    <ColabDocEditorContext.Provider
      value={{
        activeToolbarId,
        setActiveToolbarId,
        activeEditorView,
        setActiveEditorView,
        activeBlock,
        setActiveBlock,
        activeStatementElement,
        setActiveStatementElement,
        toolbarSetups,
        setToolbarSetups,
      }}
    >
      {children}
    </ColabDocEditorContext.Provider>
  );
}
