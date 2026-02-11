import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Api,
  ColabDocVersionFormat,
  CreateStatementDocRequest,
} from '../../../api/ColabriAPI';
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

// Query keys factory for statements
export const statementKeys = {
  all: ['statements'] as const,
  lists: () => [...statementKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) =>
    [...statementKeys.lists(), orgId, filters] as const,
  details: () => [...statementKeys.all, 'detail'] as const,
  detail: (orgId: string, statementId: string) =>
    [...statementKeys.details(), orgId, statementId] as const,
  version: (
    orgId: string,
    statementId: string,
    version: number,
    versionV: Record<string, number>,
    format: string,
  ) =>
    [
      ...statementKeys.detail(orgId, statementId),
      version,
      versionV,
      format,
    ] as const,
};

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_STATEMENTS: never[] = [];

// Custom hooks for user operations

/**
 * Hook to fetch a list of users in an organization with pagination
 */
export const useStatements = (
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
    queryKey: statementKeys.list(orgId, params || {}),
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

      return apiClient.orgId.getStatements(orgId, apiParams);
    },
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
  return {
    statements: data?.data ?? EMPTY_STATEMENTS,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a specific version of a statement document
 *
 * @param orgId
 * @param docId
 * @param version
 * @param versionV
 * @param enabled
 * @returns
 */
export const useStatementVersion = (
  orgId: string,
  docId: string,
  version: number,
  versionV: Record<string, number>,
  format: ColabDocVersionFormat,
  enabled = true,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: statementKeys.version(orgId, docId, version, versionV, format),
    queryFn: () =>
      apiClient.orgId.postStatementsVersion(orgId, docId, {
        version,
        versionV,
        format,
      }),
    enabled,
  });
  return {
    statement: data?.data.statement ?? null,
    binary: data?.data.binary ?? null,
    version: data?.data.version ?? null,
    versionV: data?.data.versionV ?? null,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to create a new statement
 */
export const useCreateStatement = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateStatementDocRequest) =>
      apiClient.orgId.postStatement(orgId, data),
    onSuccess: (newStatement) => {
      const { data } = newStatement;

      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: statementKeys.lists() });

      // Optionally add the new user to the cache
      queryClient.setQueryData(
        statementKeys.detail(orgId, data.id!),
        newStatement,
      );
    },
    onError: (error) => {
      console.error('Failed to create statement:', error);
    },
  });

  return {
    createStatement: mutation.mutateAsync,
    createdStatement: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
