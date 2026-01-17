import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../../api/ColabriAPI';

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
export const languageKeys = {
  all: ['languages'] as const,
  platform: () => [...languageKeys.all, 'platform'] as const,
  lists: () => [...languageKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) =>
    [...languageKeys.lists(), orgId, filters] as const,
  details: () => [...languageKeys.all, 'detail'] as const,
  detail: (orgId: string, languageId: string) =>
    [...languageKeys.details(), orgId, languageId] as const,
};

// Custom hooks for language operations

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_LANGUAGES: never[] = [];
const EMPTY_REFETCH = () => {};

/**
 * Hook to fetch a list of all languages on the platform
 */
export const usePlatformContentLanguages = (enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: languageKeys.platform(),
    queryFn: () => {
      return apiClient.languages.getLanguages();
    },
    enabled: enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  return {
    languages: data?.data ?? EMPTY_LANGUAGES,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a list of content languages in an organization
 */
export const useContentLanguages = (orgId?: string, enabled = true) => {
  if (!orgId) {
    return {
      languages: EMPTY_LANGUAGES,
      isLoading: false,
      error: null,
      refetch: EMPTY_REFETCH,
    };
  }
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: languageKeys.list(orgId, {}),
    queryFn: () => {
      return apiClient.orgId.getLanguages(orgId);
    },
    enabled: enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  return {
    languages: data?.data ?? EMPTY_LANGUAGES,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to add a new content language to an organization
 */
export const useAddContentLanguage = (orgId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (langCodes: string[]) => {
      return apiClient.orgId.postLanguage(orgId, langCodes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.list(orgId, {}) });
    },
  });
  return {
    addContentLanguage: mutation.mutateAsync,
    addedContentLanguage: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to remove a content language from an organization
 */
export const useRemoveContentLanguages = (orgId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (langCodes: string[]) => {
      return apiClient.orgId.deleteLanguage(orgId, langCodes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.list(orgId, {}) });
    },
  });
  return {
    removeContentLanguages: mutation.mutateAsync,
    removedContentLanguage: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
