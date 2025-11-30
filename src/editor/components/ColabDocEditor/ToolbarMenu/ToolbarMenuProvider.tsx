import React, { ReactNode } from 'react';
import ToolbarMenuContext, {
  ToolbarSetup,
  ToolbarSetups,
} from './ToolbarMenuContext';
import { EditorView } from 'prosemirror-view';

export function useToolbarContext() {
  const context = React.useContext(ToolbarMenuContext);
  if (!context) {
    throw new Error('useToolbarSetup must be used within ToolbarMenuProvider');
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

type ToolbarMenuProviderProps = {
  children: ReactNode;
};

export default function ToolbarMenuProvider({
  children,
}: ToolbarMenuProviderProps) {
  // Initialize the state that will keep track of the active toolbar ID
  const [activeToolbarId, setActiveToolbarId] = React.useState<string | null>(
    null,
  );

  // The currently active editor view
  const [activeEditorView, setActiveEditorView] =
    React.useState<EditorView | null>(null);

  // Intialize the state that will keep track of toolbar setups
  const [toolbarSetups, setToolbarSetups] = React.useState<ToolbarSetups>({});

  return (
    <ToolbarMenuContext.Provider
      value={{
        activeToolbarId,
        setActiveToolbarId,
        activeEditorView,
        setActiveEditorView,
        toolbarSetups,
        setToolbarSetups,
      }}
    >
      {children}
    </ToolbarMenuContext.Provider>
  );
}
