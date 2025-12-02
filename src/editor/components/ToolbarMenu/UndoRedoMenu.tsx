import { Stack } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useActiveEditorView } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { UndoRedoButton } from './ToolbarMenuStyles';
import { undo, redo, canUndo, canRedo } from 'loro-prosemirror';

export type UndoRedoMenuProps = {};

export default function UndoRedoMenu({}: UndoRedoMenuProps) {
  const activeEditorView = useActiveEditorView();

  const doUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (activeEditorView) {
      undo(activeEditorView.state, activeEditorView.dispatch, activeEditorView);
      activeEditorView.focus();
    }
  };

  const doRedo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (activeEditorView) {
      redo(activeEditorView.state, activeEditorView.dispatch, activeEditorView);
      activeEditorView.focus();
    }
  };

  const disabledUndo = activeEditorView
    ? !canUndo(activeEditorView.state)
    : true;
  const disabledRedo = activeEditorView
    ? !canRedo(activeEditorView.state)
    : true;

  return (
    <Stack direction="row" spacing={'2px'}>
      <UndoRedoButton key={'undo'} disabled={disabledUndo} onMouseDown={doUndo}>
        <UndoIcon />
      </UndoRedoButton>
      <UndoRedoButton key={'redo'} disabled={disabledRedo} onMouseDown={doRedo}>
        <RedoIcon />
      </UndoRedoButton>
    </Stack>
  );
}
