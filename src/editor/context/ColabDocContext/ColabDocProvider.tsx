import { useContext } from 'react';

import ColabDocContext, { ColabDocContextType } from './ColabDocContext';

export function useColabDoc(): ColabDocContextType {
  const colabDocContext = useContext(ColabDocContext);
  if (!colabDocContext) {
    return {
      docId: null,
      colabDoc: null,
      error: null,
    };
  } else {
    return colabDocContext;
  }
}
