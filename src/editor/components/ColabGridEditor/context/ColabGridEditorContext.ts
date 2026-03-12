import { createContext } from 'react';

export type ActiveCellRef = {
  rowId: string;
  field: string;
};

export type ColabGridEditorContextType = {
  readOnly: boolean;
  setReadOnly: (readOnly: boolean) => void;
  activeCell: ActiveCellRef | null;
  setActiveCell: (cellRef: ActiveCellRef | null) => void;
};

const ColabGridEditorContext = createContext<ColabGridEditorContextType | null>(
  null,
);

export default ColabGridEditorContext;
