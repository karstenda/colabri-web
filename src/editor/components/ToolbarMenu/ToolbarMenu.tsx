import FormattingMenu from './FormattingMenu';
import { useActiveToolbarSetup } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import UndoRedoMenu from './UndoRedoMenu';
import { ToolbarMenuDivider } from './ToolbarMenuStyles';
import StatementMenu from './StatementMenu';
import { useMediaQuery } from '@mui/material';
import { DocumentType } from '../../../api/ColabriAPI';
import SheetMenu from './SheetMenu';

export type ToolbarMenuProps = {
  docType?: DocumentType;
};

export default function ToolbarMenu({ docType }: ToolbarMenuProps) {
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
      {docType === DocumentType.DocumentTypeColabStatement && <StatementMenu />}
      {docType === DocumentType.DocumentTypeColabSheet && <SheetMenu />}
    </>
  );
}
