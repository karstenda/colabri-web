import { createContext } from 'react';
import { ConnectedColabDoc } from '../../data/ColabDoc';

export type ColabDocContextType = {
  docId: string | null;
  colabDoc: ConnectedColabDoc | null;
};

const ColabDocContext = createContext<ColabDocContextType | null>(null);

export default ColabDocContext;
