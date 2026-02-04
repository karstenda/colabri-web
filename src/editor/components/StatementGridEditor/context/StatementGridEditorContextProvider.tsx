import { useContext, useState } from 'react';
import StatementGridEditorContext, {
  ActiveCellRef,
} from './StatementGridEditorContext';

export type StatementGridEditorContextProviderProps = {
  readOnly?: boolean;
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

export function useStatementGridEditorReadOnly() {
  const context = useStatementGridEditorContext();
  return context.readOnly;
}

export function useSetStatementGridEditorReadOnly() {
  const context = useStatementGridEditorContext();
  return context.setReadOnly;
}

export default function StatementGridEditorContextProvider({
  readOnly: readOnlyProp,
  children,
}: StatementGridEditorContextProviderProps) {
  const [activeCell, setActiveCell] = useState<ActiveCellRef | null>(null);

  const [readOnly, setReadOnly] = useState<boolean>(readOnlyProp ?? false);
  return (
    <StatementGridEditorContext.Provider
      value={{
        readOnly,
        setReadOnly,
        activeCell,
        setActiveCell,
      }}
    >
      {children}
    </StatementGridEditorContext.Provider>
  );
}
