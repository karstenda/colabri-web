import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../../api/ColabriAPI';
import { ResolvedPrpl } from '../../../api/ColabriAPI';

// Create a singleton API client instance
const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Query keys factory for groups
export const prplKeys = {
  all: ['prpls'] as const,
  resolved: () => [...prplKeys.all, 'resolved'] as const,
  resolvedItem: (prplString: string) =>
    [...prplKeys.resolved(), prplString] as const,
  resolvedBatch: (prplStrings: string[]) =>
    [...prplKeys.resolved(), 'batch', [...prplStrings].sort()] as const,
};

// Fetch multiple prpls efficiently
export function useResolvedPrpls(prplStrings: string[]) {
  const queryClient = useQueryClient();

  // Check which prpls are already cached
  const { cached, uncached } = prplStrings.reduce<{
    cached: Array<{ prpl: string; data: ResolvedPrpl }>;
    uncached: string[];
  }>(
    (acc, prpl) => {
      const data = queryClient.getQueryData<ResolvedPrpl>(
        prplKeys.resolvedItem(prpl),
      );
      data ? acc.cached.push({ prpl, data }) : acc.uncached.push(prpl);
      return acc;
    },
    { cached: [], uncached: [] },
  );

  // Fetch only uncached ones in bulk
  const bulkQuery = useQuery({
    queryKey: prplKeys.resolvedBatch(uncached),
    queryFn: async () => {
      const response = await apiClient.prpls.postPrplsResolve(uncached);
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: uncached.length > 0,
  });

  // Populate individual cache entries when data is fetched
  if (bulkQuery.data) {
    for (const [prpl, resolved] of Object.entries(bulkQuery.data)) {
      queryClient.setQueryData(prplKeys.resolvedItem(prpl), resolved);
    }
  }

  return {
    data: {
      ...cached
        .map(({ prpl, data }) => ({ [prpl]: data }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      ...bulkQuery.data,
    } as Record<string, ResolvedPrpl>,
    isLoading: bulkQuery.isLoading,
  };
}
