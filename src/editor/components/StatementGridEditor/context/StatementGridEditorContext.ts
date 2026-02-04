import { createContext } from 'react';

export type ActiveCellRef = {
  rowId: string;
  field: string;
};

export type StatementGridEditorContextType = {
  readOnly: boolean;
  setReadOnly: (readOnly: boolean) => void;
  activeCell: ActiveCellRef | null;
  setActiveCell: (cellRef: ActiveCellRef | null) => void;
};

const StatementGridEditorContext =
  createContext<StatementGridEditorContextType | null>(null);

export default StatementGridEditorContext;
