import React, { ReactNode } from 'react';
import ColabDocEditorContext, { ToolbarSetup } from './ColabDocEditorContext';
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

export function useActiveBlockId() {
  const context = useToolbarContext();
  return context.activeBlockId;
}

export function useSetActiveBlockId() {
  const context = useToolbarContext();
  return context.setActiveBlockId;
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
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(null);

  // Intialize the state that will keep track of toolbar setups
  const [toolbarSetups, setToolbarSetups] = React.useState<ToolbarSetups>({});

  return (
    <ColabDocEditorContext.Provider
      value={{
        activeToolbarId,
        setActiveToolbarId,
        activeEditorView,
        setActiveEditorView,
        activeBlockId,
        setActiveBlockId,
        toolbarSetups,
        setToolbarSetups,
      }}
    >
      {children}
    </ColabDocEditorContext.Provider>
  );
}
