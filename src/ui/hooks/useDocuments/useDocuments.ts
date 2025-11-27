import { useQuery } from '@tanstack/react-query';
import { Api } from '../../../api/ColabriAPI';

// Create a singleton API client instance
const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Query keys factory for statements
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) =>
    [...documentKeys.lists(), orgId, filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (orgId: string, statementId: string) =>
    [...documentKeys.details(), orgId, statementId] as const,
};

export const useDocument = (orgId: string, docId: string, enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: documentKeys.detail(orgId, docId),
    queryFn: () => {
      return apiClient.orgId.getDocument(orgId, docId);
    },
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
  return { document: data?.data, isLoading, error, refetch };
};
