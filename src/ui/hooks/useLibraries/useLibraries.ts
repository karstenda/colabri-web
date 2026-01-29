import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Api,
  Library,
  CreateLibraryRequest,
  UpdateLibraryRequest,
} from '../../../api/ColabriAPI';
import {
  GridListFilterModel,
  GridListSortModel,
} from '../../data/GridListOptions';

export type { Library };

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

// Query keys factory for libraries
export const libraryKeys = {
  all: ['libraries'] as const,
  lists: () => [...libraryKeys.all, 'list'] as const,
  list: (orgId: string) => [...libraryKeys.lists(), orgId] as const,
  details: () => [...libraryKeys.all, 'detail'] as const,
  detail: (orgId: string, libraryId: string) =>
    [...libraryKeys.details(), orgId, libraryId] as const,
};

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_LIBRARIES: never[] = [];

// Custom hooks for library operations

/**
 * Hook to fetch a list of libraries in an organization with pagination
 */
export const useLibraries = (orgId: string, enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: libraryKeys.list(orgId),
    queryFn: () => {
      return apiClient.orgId.getLibraries(orgId);
    },
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Cast to Library[] because the generated type might be incorrect (singular vs array)
  return {
    libraries: (data?.data as unknown as Library[]) ?? EMPTY_LIBRARIES,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a single library
 */
export const useLibrary = (
  orgId: string,
  libraryId: string,
  enabled = true,
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: libraryKeys.detail(orgId, libraryId),
    queryFn: () => apiClient.orgId.getLibrarie(orgId, libraryId),
    enabled: enabled && !!orgId && !!libraryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { library: data?.data, isLoading, error };
};

/**
 * Hook to create a library
 */
export const useCreateLibrary = (orgId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (data: CreateLibraryRequest) =>
      apiClient.orgId.postLibrarie(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });

  return { createLibrary: mutateAsync, isPending, error };
};

/**
 * Hook to update a library
 */
export const useUpdateLibrary = (orgId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      libraryId,
      data,
    }: {
      libraryId: string;
      data: UpdateLibraryRequest;
    }) => apiClient.orgId.patchLibrarie(orgId, libraryId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: libraryKeys.detail(orgId, variables.libraryId),
      });
      queryClient.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });

  return { updateLibrary: mutateAsync, isPending, error };
};

/**
 * Hook to delete a library
 */
export const useDeleteLibrary = (orgId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (libraryId: string) =>
      apiClient.orgId.deleteLibrarie(orgId, libraryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });

  return { deleteLibrary: mutateAsync, isPending, error };
};
