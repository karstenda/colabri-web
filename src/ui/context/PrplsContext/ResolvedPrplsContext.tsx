import * as React from 'react';
import { ResolvedPrpl } from '../../../api/ColabriAPI';

const ResolvedPrplsContext = React.createContext<{
  resolvedPrpls: Record<string, ResolvedPrpl>;
  requestedResolvedPrpls: string[];
  setRequestedResolvedPrpls: (prpls: string[]) => void;
} | null>(null);

export default ResolvedPrplsContext;
