import FormattingMenu from './FormattingMenu';
import {
  useActiveStatementElement,
  useActiveToolbarSetup,
} from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import UndoRedoMenu from './UndoRedoMenu';
import { ToolbarMenuDivider } from './ToolbarMenuStyles';
import StatementMenu from './StatementMenu';
import { useMediaQuery } from '@mui/material';
import { DocumentType } from '../../../api/ColabriAPI';
import SheetMenu from './SheetMenu';
import LibraryMenu from './LibraryMenu';
import { DocContainer } from '../../data/DocContainer';

export type ToolbarMenuProps = {
  docType?: DocumentType;
  container?: DocContainer;
  readOnly?: boolean;
};

export default function ToolbarMenu({
  docType,
  container,
  readOnly,
}: ToolbarMenuProps) {
  const toolbarSetup = useActiveToolbarSetup();
  const activeStatementElementRef = useActiveStatementElement();
  const compactView = useMediaQuery('(max-width:800px)');

  const showStmtControls =
    docType === DocumentType.DocumentTypeColabStatement ||
    activeStatementElementRef != null;

  const showSheetControls = docType === DocumentType.DocumentTypeColabSheet;

  const showLibraryControls = container ? container.type !== 'library' : true;

  return (
    <>
      {!compactView && !readOnly && (
        <>
          <UndoRedoMenu />
          <ToolbarMenuDivider />
        </>
      )}
      {!readOnly && <FormattingMenu setup={toolbarSetup?.formatting || {}} />}
      {showSheetControls && <SheetMenu readOnly={readOnly} />}
      {showStmtControls && (
        <StatementMenu
          activeStatementElementRef={activeStatementElementRef}
          readOnly={readOnly}
        />
      )}
      {showLibraryControls && <LibraryMenu />}
    </>
  );
}
