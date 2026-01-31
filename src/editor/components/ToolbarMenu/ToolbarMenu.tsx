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

export type ToolbarMenuProps = {
  docType?: DocumentType;
  readOnly?: boolean;
};

export default function ToolbarMenu({ docType, readOnly }: ToolbarMenuProps) {
  const toolbarSetup = useActiveToolbarSetup();
  const activeStatementElementRef = useActiveStatementElement();
  const compactView = useMediaQuery('(max-width:800px)');

  const showStmtControls =
    docType === DocumentType.DocumentTypeColabStatement ||
    activeStatementElementRef != null;

  const showSheetControls = docType === DocumentType.DocumentTypeColabSheet;

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
    </>
  );
}
