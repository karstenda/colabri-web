import FormattingMenu from './FormattingMenu';
import { useActiveToolbarSetup } from './ToolbarMenuProvider';
import UndoRedoMenu from './UndoRedoMenu';
import { ToolbarMenuDivider } from './ToolbarMenuStyles';

export default function ToolbarMenu() {
  const toolbarSetup = useActiveToolbarSetup();
  return (
    <>
      <UndoRedoMenu />
      <ToolbarMenuDivider />
      <FormattingMenu setup={toolbarSetup?.formatting || {}} />
    </>
  );
}
