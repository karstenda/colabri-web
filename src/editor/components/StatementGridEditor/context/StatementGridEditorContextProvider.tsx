import { useContext, useState } from 'react';
import StatementGridEditorContext, {
  ActiveCellRef,
} from './StatementGridEditorContext';

export type StatementGridEditorContextProviderProps = {
  children: React.ReactNode;
};

export function useActiveCell() {
  const context = useStatementGridEditorContext();
  return context.activeCell;
}

export function useSetActiveCell() {
  const context = useStatementGridEditorContext();
  return context.setActiveCell;
}

export function useStatementGridEditorContext() {
  const context = useContext(StatementGridEditorContext);
  if (!context) {
    throw new Error(
      'useStatementGridEditorContext must be used within StatementGridEditorContextProvider',
    );
  }
  return context;
}

export default function StatementGridEditorContextProvider({
  children,
}: StatementGridEditorContextProviderProps) {
  const [activeCell, setActiveCell] = useState<ActiveCellRef | null>(null);

  return (
    <StatementGridEditorContext.Provider
      value={{
        activeCell,
        setActiveCell,
      }}
    >
      {children}
    </StatementGridEditorContext.Provider>
  );
}
