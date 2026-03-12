import { useContext, useMemo, useState } from 'react';
import ColabGridEditorContext, {
  ActiveCellRef,
} from './ColabGridEditorContext';

export type ColabGridEditorContextProviderProps = {
  readOnly?: boolean;
  children: React.ReactNode;
};

export function useActiveCell() {
  const context = useColabGridEditorContext();
  return context.activeCell;
}

export function useSetActiveCell() {
  const context = useColabGridEditorContext();
  return context.setActiveCell;
}

export function useColabGridEditorContext() {
  const context = useContext(ColabGridEditorContext);
  if (!context) {
    throw new Error(
      'useColabGridEditorContext must be used within ColabGridEditorContextProvider',
    );
  }
  return context;
}

export function useColabGridEditorReadOnly() {
  const context = useColabGridEditorContext();
  return context.readOnly;
}

export function useSetColabGridEditorReadOnly() {
  const context = useColabGridEditorContext();
  return context.setReadOnly;
}

export default function ColabGridEditorContextProvider({
  readOnly: readOnlyProp,
  children,
}: ColabGridEditorContextProviderProps) {
  const [activeCell, setActiveCell] = useState<ActiveCellRef | null>(null);

  const [readOnly, setReadOnly] = useState<boolean>(readOnlyProp ?? false);

  const contextValue = useMemo(
    () => ({ readOnly, setReadOnly, activeCell, setActiveCell }),
    [readOnly, activeCell],
  );

  return (
    <ColabGridEditorContext.Provider value={contextValue}>
      {children}
    </ColabGridEditorContext.Provider>
  );
}
