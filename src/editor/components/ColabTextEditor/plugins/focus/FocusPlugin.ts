import { PluginKey, Plugin as ProseMirrorPlugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

type FocusPluginProps = {
  onFocus: (view: EditorView) => void;
  onBlur: (view: EditorView) => void;
};

const FocusPlugin = ({
  onFocus,
  onBlur,
}: FocusPluginProps): ProseMirrorPlugin => {
  const key = new PluginKey('colabri-focus-plugin');

  // Create a ProseMirror plugin that updates the toolbar state on editor changes
  return new ProseMirrorPlugin({
    key,
    props: {
      // Start tracking focus/blur events to potentially update toolbar state
      handleDOMEvents: {
        blur: (view) => {
          onBlur(view);
          return false;
        },
        focus: (view) => {
          onFocus(view);
          return false;
        },
      },
    },
  });
};

export default FocusPlugin;
