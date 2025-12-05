import FormattingMenu from './FormattingMenu';
import { useActiveToolbarSetup } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import UndoRedoMenu from './UndoRedoMenu';
import { ToolbarMenuDivider } from './ToolbarMenuStyles';
import StatementMenu from './StatementMenu';
import { useMediaQuery } from '@mui/material';

export default function ToolbarMenu() {
  const toolbarSetup = useActiveToolbarSetup();
  const compactView = useMediaQuery('(max-width:800px)');
  return (
    <>
      {!compactView && (
        <>
          <UndoRedoMenu />
          <ToolbarMenuDivider />
        </>
      )}
      <FormattingMenu setup={toolbarSetup?.formatting || {}} />
      <StatementMenu />
    </>
  );
}
