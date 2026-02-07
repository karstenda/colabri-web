import { createContext } from 'react';
import { ColabDoc } from '../../data/ColabDoc';
import { ColabLoroDoc } from '../../data/ColabLoroDoc';

export type ColabDocContextType = {
  docId: string | null;
  colabDoc: ColabDoc<ColabLoroDoc> | null;
  error: Error | null;
};

const ColabDocContext = createContext<ColabDocContextType | null>(null);

export default ColabDocContext;
