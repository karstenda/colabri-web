import { createContext } from 'react';
import { ConnectedColabDoc } from '../../data/ConnectedColabDoc';
import { ColabLoroDoc } from '../../data/ColabDoc';

export type ColabDocContextType = {
  docId: string | null;
  colabDoc: ConnectedColabDoc<ColabLoroDoc> | null;
};

const ColabDocContext = createContext<ColabDocContextType | null>(null);

export default ColabDocContext;
