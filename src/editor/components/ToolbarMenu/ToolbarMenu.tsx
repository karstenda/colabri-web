import FormattingMenu from './FormattingMenu';
import { useActiveToolbarSetup } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import UndoRedoMenu from './UndoRedoMenu';
import { ToolbarMenuDivider } from './ToolbarMenuStyles';
import StatementMenu from './StatementMenu';

export default function ToolbarMenu() {
  const toolbarSetup = useActiveToolbarSetup();
  return (
    <>
      <UndoRedoMenu />
      <ToolbarMenuDivider />
      <FormattingMenu setup={toolbarSetup?.formatting || {}} />
      <StatementMenu />
    </>
  );
}
