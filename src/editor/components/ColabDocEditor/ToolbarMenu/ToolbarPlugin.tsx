import { PluginKey, Plugin as ProseMirrorPlugin } from 'prosemirror-state';
import { ToolbarSetup } from './ToolbarMenuContext';
import { EditorView } from 'prosemirror-view';
import { FormattingSetup } from './FormattingMenuSetup';

type ToolbarPluginProps = {
  toolbarId: string;
  toolbarSetup: ToolbarSetup;
  setToolbarSetup: (toolbarId: string, setup: ToolbarSetup | undefined) => void;
  setActiveToolbar: (
    toolbarId: string | null,
    editorView: EditorView | null,
  ) => void;
};

const ToolbarPlugin = ({
  toolbarId,
  toolbarSetup,
  setToolbarSetup,
  setActiveToolbar,
}: ToolbarPluginProps): ProseMirrorPlugin => {
  const key = new PluginKey('toolbar-plugin');

  // Create a ProseMirror plugin that updates the toolbar state on editor changes
  return new ProseMirrorPlugin({
    key,
    view(editorView) {
      return {
        update: () => {
          // Iterate over the toolbar setup items
          const formattingSetup = { ...toolbarSetup.formatting };

          // Check if we need to update the state
          let needsUpdate = false;
          for (const formattingKey in formattingSetup) {
            // Get the item
            const item =
              formattingSetup[formattingKey as keyof typeof formattingSetup];
            if (!item?.isActive) {
              continue;
            }

            // Check if the item is active
            const isActive = item.isActive(editorView.state);

            // Check if this needs to trigger a state change
            if (item.active !== isActive) {
              const newItem = {
                ...item,
                active: isActive,
              };
              formattingSetup[formattingKey as keyof FormattingSetup] = newItem;
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            // Update the toolbar setup state
            setToolbarSetup(toolbarId, {
              ...toolbarSetup,
              formatting: {
                ...formattingSetup,
              },
            });
          }
        },
        destroy: () => {
          setToolbarSetup(toolbarId, undefined);
        },
      };
    },
    props: {
      // Start tracking focus/blur events to potentially update toolbar state
      handleDOMEvents: {
        blur: () => {
          setActiveToolbar(null, null);
          return false;
        },
        focus: (view) => {
          setActiveToolbar(toolbarId, view);
          return false;
        },
      },
    },
  });
};

export default ToolbarPlugin;
