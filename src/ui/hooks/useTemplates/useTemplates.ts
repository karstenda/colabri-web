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

// Query keys factory for templates
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) =>
    [...templateKeys.lists(), orgId, filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (orgId: string, templateId: string) =>
    [...templateKeys.details(), orgId, templateId] as const,
};

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_CONTENT_TYPES: never[] = [];

/**
 * Hook to fetch a list of templates in an organization with pagination
 **/
export const useContentTypes = (orgId: string, enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: templateKeys.list(orgId, {}),
    queryFn: () => {
      return apiClient.orgId.getContentTypes(orgId);
    },
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    contentTypes: data?.data ?? EMPTY_CONTENT_TYPES,
    isLoading,
    error,
    refetch,
  };
};
