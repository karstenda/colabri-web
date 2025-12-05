import { useState } from 'react';
import ResolvedPrplsContext from './ResolvedPrplsContext';
import { useResolvedPrpls } from '../../hooks/useResolvedPrpls/useResolvedPrpls';
import React from 'react';
import { ResolvedPrpl } from '../../../api/ColabriAPI';

export type ResolvedPrplOption =
  | ResolvedPrpl
  | {
      type: 'loading';
      prpl: string;
    };

// Hook to get a resolved prpl from the context
export const useCachedResolvedPrpl = (prpl: string): ResolvedPrplOption => {
  return useCachedResolvedPrpls([prpl])[prpl];
};

// Hook to get multiple resolved prpls from the context
export const useCachedResolvedPrpls = (
  prpls: string[],
): Record<string, ResolvedPrplOption> => {
  const resolvedPrplsContext = React.useContext(ResolvedPrplsContext);
  if (!resolvedPrplsContext) {
    throw new Error(
      'useResolvedPrpls must be used within a ResolvedPrplsProvider',
    );
  }
  // Get the resolved prpls and the setter from context
  const { resolvedPrpls, setRequestedResolvedPrpls, requestedResolvedPrpls } =
    resolvedPrplsContext;
  React.useEffect(() => {
    // Only add the prpls that are not already in the requested list
    const newPrpls = prpls.filter(
      (prpl) => !requestedResolvedPrpls.includes(prpl),
    );
    if (newPrpls.length > 0) {
      setRequestedResolvedPrpls([...requestedResolvedPrpls, ...newPrpls]);
    }
  }, [prpls, requestedResolvedPrpls, setRequestedResolvedPrpls]);

  // Return the resolved prpls for the requested list
  const result: Record<string, ResolvedPrplOption> = {};
  prpls.forEach((prpl) => {
    if (resolvedPrpls[prpl]) {
      result[prpl] = resolvedPrpls[prpl];
    } else {
      result[prpl] = {
        type: 'loading',
        prpl: prpl,
      };
    }
  });
  return result;
};

// Hook to set a resolved prpl into the context
export const useSetCachedResolvedPrpl = (resolvedPrpl: ResolvedPrpl): void => {
  const resolvedPrplsContext = React.useContext(ResolvedPrplsContext);
  if (!resolvedPrplsContext) {
    throw new Error(
      'useSetResolvedPrpl must be used within a ResolvedPrplsProvider',
    );
  }
  const { setRequestedResolvedPrpls, requestedResolvedPrpls } =
    resolvedPrplsContext;
  React.useEffect(() => {
    if (!requestedResolvedPrpls.includes(resolvedPrpl.prpl)) {
      setRequestedResolvedPrpls([...requestedResolvedPrpls, resolvedPrpl.prpl]);
    }
  }, [resolvedPrpl, requestedResolvedPrpls, setRequestedResolvedPrpls]);
};

// This provider fetches and provides resolved prpls to its children
// (We create a provider for this so we can potentially batch the requests for multiple components in advance)
const ResolvedPrplsProvider: React.FC<{
  prpls: string[];
  children: React.ReactNode;
}> = ({ prpls, children }) => {
  // State to track requested resolved prpls
  const [requestedResolvedPrpls, setRequestedResolvedPrpls] =
    useState<string[]>(prpls);

  // Actually resolve the prpls
  const { data: resolvedPrpls } = useResolvedPrpls(requestedResolvedPrpls);

  return (
    <ResolvedPrplsContext.Provider
      value={{
        resolvedPrpls,
        requestedResolvedPrpls,
        setRequestedResolvedPrpls,
      }}
    >
      {children}
    </ResolvedPrplsContext.Provider>
  );
};

export default ResolvedPrplsProvider;
