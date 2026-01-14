import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api, CreateSheetDocRequest } from '../../../api/ColabriAPI';
import {
  GridListFilterModel,
  GridListSortModel,
} from '../../data/GridListOptions';

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

// Query keys factory for sheets
export const sheetKeys = {
  all: ['sheets'] as const,
  lists: () => [...sheetKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) =>
    [...sheetKeys.lists(), orgId, filters] as const,
  details: () => [...sheetKeys.all, 'detail'] as const,
  detail: (orgId: string, sheetId: string) =>
    [...sheetKeys.details(), orgId, sheetId] as const,
};

// Custom hooks for user operations

/**
 * Hook to fetch a list of sheets in an organization with pagination
 */
export const useSheets = (
  orgId: string,
  params?: {
    limit?: number;
    offset?: number;
    sort?: GridListSortModel;
    filter?: GridListFilterModel;
  },
  enabled = true,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: sheetKeys.list(orgId, params || {}),
    queryFn: () => {
      const apiParams: {
        limit?: number;
        offset?: number;
        filter?: string;
        sort?: string;
      } = {};

      if (params?.limit) {
        apiParams.limit = params.limit;
      }
      if (params?.offset) {
        apiParams.offset = params.offset;
      }
      if (params?.filter) {
        apiParams.filter = JSON.stringify(params.filter);
      }
      if (params?.sort) {
        apiParams.sort = JSON.stringify(params.sort);
      }

      return apiClient.orgId.getSheets(orgId, apiParams);
    },
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
  return { sheets: data?.data || [], isLoading, error, refetch };
};

/**
 * Hook to create a new sheet
 */
export const useCreateSheet = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateSheetDocRequest) =>
      apiClient.orgId.postSheet(orgId, data),
    onSuccess: (newSheet) => {
      const { data } = newSheet;

      // Invalidate and refetch sheets list
      queryClient.invalidateQueries({ queryKey: sheetKeys.lists() });

      // Optionally add the new sheet to the cache
      queryClient.setQueryData(sheetKeys.detail(orgId, data.id!), newSheet);
    },
    onError: (error) => {
      console.error('Failed to create sheet:', error);
    },
  });

  return {
    createSheet: mutation.mutateAsync,
    createdSheet: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
