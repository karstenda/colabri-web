import { toggleMark, setBlockType, wrapIn, lift } from 'prosemirror-commands';
import { Command, EditorState } from 'prosemirror-state';
import { MarkType, NodeType, Schema } from 'prosemirror-model';

export type FormattingToggleMark =
  | 'strong'
  | 'italic'
  | 'underline'
  | 'subscript'
  | 'superscript';

export type FormattingWrapIn =
  | 'indent_decrease'
  | 'bullet_list'
  | 'ordered_list';

export type FormattingBlockType = 'paragraph' | 'heading';

export type FormattingCommandType =
  | FormattingToggleMark
  | FormattingWrapIn
  | FormattingBlockType;

export type FormattingSetup = {
  [key in FormattingCommandType]?: {
    active: boolean;
    disabled: boolean;
    command: Command;
    isActive?: (state: EditorState) => boolean;
  };
};

// Helper function to check if a mark is active
const isMarkActive = (state: EditorState, markType: MarkType): boolean => {
  if (!markType) {
    return false;
  }
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    const marks = state.storedMarks || $from.marks();
    return marks.some((mark) => mark.type.name === markType.name);
  }
  return state.doc.rangeHasMark(from, to, markType);
};

// Helper function to check if a block type is active
const isBlockActive = (state: EditorState, nodeType: NodeType): boolean => {
  const { $from, to, node } = state.selection as any;
  if (node) {
    return node.hasMarkup(nodeType);
  }
  return to <= $from.end() && $from.parent.hasMarkup(nodeType);
};

// Helper function to check if selection is wrapped in a node type
const isWrappedIn = (state: EditorState, nodeType: NodeType): boolean => {
  const { $from, $to } = state.selection;
  let depth = $from.sharedDepth($to.pos);
  if (depth === 0) return false;
  for (let d = depth; d > 0; d--) {
    if ($from.node(d).type === nodeType) {
      return true;
    }
  }
  return false;
};

export const createFormattingSetup = (schema: Schema): FormattingSetup => ({
  strong: {
    active: false,
    disabled: false,
    command: toggleMark(schema.marks.strong),
    isActive: (state) => isMarkActive(state, schema.marks.strong),
  },
  italic: {
    active: false,
    disabled: false,
    command: toggleMark(schema.marks.em),
    isActive: (state) => isMarkActive(state, schema.marks.em),
  },
  underline: {
    active: false,
    disabled: false,
    command: toggleMark(schema.marks.underline),
    isActive: (state) => isMarkActive(state, schema.marks.underline),
  },
  subscript: {
    active: false,
    disabled: false,
    command: toggleMark(schema.marks.subscript),
    isActive: (state) => isMarkActive(state, schema.marks.subscript),
  },
  superscript: {
    active: false,
    disabled: false,
    command: toggleMark(schema.marks.superscript),
    isActive: (state) => isMarkActive(state, schema.marks.superscript),
  },
  bullet_list: {
    active: false,
    disabled: false,
    command: wrapIn(schema.nodes.bullet_list),
    isActive: (state) => isWrappedIn(state, schema.nodes.bullet_list),
  },
  ordered_list: {
    active: false,
    disabled: false,
    command: wrapIn(schema.nodes.ordered_list),
    isActive: (state) => isWrappedIn(state, schema.nodes.ordered_list),
  },
  indent_decrease: {
    active: false,
    disabled: false,
    command: lift,
    isActive: () => false,
  },
  paragraph: {
    active: false,
    disabled: false,
    command: setBlockType(schema.nodes.paragraph),
    isActive: (state) => isBlockActive(state, schema.nodes.paragraph),
  },
  heading: {
    active: false,
    disabled: false,
    command: setBlockType(schema.nodes.heading, { level: 1 }),
    isActive: (state) => isBlockActive(state, schema.nodes.heading),
  },
});

// Deprecated: Use createFormattingSetup instead
export const defaultStatementFormattingSetup = createFormattingSetup;
