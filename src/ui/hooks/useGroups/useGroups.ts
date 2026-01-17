import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Api,
  CreateGroupRequest,
  UpdateGroupRequest,
} from '../../../api/ColabriAPI';
import {
  GridListFilterModel,
  GridListSortModel,
} from '../../data/GridListOptions';
import { userKeys } from '../useUsers/useUsers';

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
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) =>
    [...groupKeys.lists(), orgId, filters] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (orgId: string, groupId: string) =>
    [...groupKeys.details(), orgId, groupId] as const,
  members: (
    orgId: string,
    groupId: string,
    params: {
      limit?: number;
      offset?: number;
      sort?: GridListSortModel;
      filter?: GridListFilterModel;
    },
  ) => [...groupKeys.detail(orgId, groupId), 'members', params] as const,
};

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_GROUPS: never[] = [];

// Custom hooks for group operations

/**
 * Hook to fetch a list of groups in an organization with pagination
 */
export const useGroups = (
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
    queryKey: groupKeys.list(orgId, params || {}),
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

      return apiClient.orgId.getGroups(orgId, apiParams);
    },
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { groups: data?.data ?? EMPTY_GROUPS, isLoading, error, refetch };
};

/**
 * Hook to fetch all members in a group
 * @param orgId
 * @param groupId
 * @param enabled
 * @returns
 */
export const useGroupMembers = (
  orgId: string,
  groupId: string,
  params?: {
    limit?: number;
    offset?: number;
    sort?: GridListSortModel;
    filter?: GridListFilterModel;
  },
  enabled = true,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: groupKeys.members(orgId, groupId, params || {}),
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

      return apiClient.orgId.getGroupsMembers(orgId, groupId, apiParams);
    },
    enabled: enabled && !!orgId && !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { members: data?.data || [], isLoading, error, refetch };
};

/**
 * Hook to fetch a single group by ID
 */
export const useGroup = (orgId: string, groupId: string, enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: groupKeys.detail(orgId, groupId),
    queryFn: () => apiClient.orgId.getGroup(orgId, groupId),
    enabled: enabled && !!orgId && !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { group: data?.data || null, isLoading, error, refetch };
};

/**
 * Hook to fetch a single group by name
 */
export const useGroupByName = (
  orgId: string,
  groupName: string,
  enabled = true,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...groupKeys.details(), orgId, 'by-name', groupName] as const,
    queryFn: () => apiClient.orgId.getGroupsByName(orgId, { name: groupName }),
    enabled: enabled && !!orgId && !!groupName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { group: data?.data || null, isLoading, error, refetch };
};

/**
 * Hook to create a new group
 */
export const useCreateGroup = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateGroupRequest) =>
      apiClient.orgId.postGroup(orgId, data),
    onSuccess: (newGroup) => {
      // Invalidate and refetch groups list
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });

      // Optionally add the new group to the cache
      queryClient.setQueryData(
        groupKeys.detail(orgId, newGroup.data.id!),
        newGroup,
      );
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
    },
  });
  return {
    createGroup: mutation.mutateAsync,
    createdGroup: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to update an existing group
 */
export const useUpdateGroup = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: UpdateGroupRequest;
    }) => apiClient.orgId.patchGroup(orgId, groupId, data),
    onSuccess: (updatedGroup, variables) => {
      const { groupId } = variables;

      // Update the specific group in cache
      queryClient.setQueryData(groupKeys.detail(orgId, groupId), updatedGroup);

      // Invalidate groups list to reflect changes
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update group:', error);
    },
  });
  return {
    updateGroup: mutation.mutateAsync,
    updatedGroup: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to delete a group
 */
export const useDeleteGroup = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (groupId: string) =>
      apiClient.orgId.deleteGroup(orgId, groupId),
    onSuccess: (_, groupId) => {
      // Remove the group from cache
      queryClient.removeQueries({ queryKey: groupKeys.detail(orgId, groupId) });

      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete group:', error);
    },
  });
  return {
    deleteGroup: mutation.mutateAsync,
    deletedGroup: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

// Add members to a group
export const useAddGroupMembers = (orgId: string, groupId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (memberIds: string[]) =>
      apiClient.orgId.postGroupsMember(orgId, groupId, { userIds: memberIds }),
    onSuccess: (_, memberIds) => {
      // Invalidate group members list to reflect changes
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(orgId, groupId, {}),
      });

      // Invalidate the user groups as they might have changed
      for (const userId of memberIds) {
        queryClient.invalidateQueries({
          queryKey: userKeys.groups(orgId, userId),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to add group members:', error);
    },
  });
  return {
    addGroupMembers: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

// Remove members from a group
export const useRemoveGroupMembers = (orgId: string, groupId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (memberIds: string[]) =>
      apiClient.orgId.deleteGroupsMember(orgId, groupId, {
        userIds: memberIds,
      }),
    onSuccess: (_, memberIds) => {
      // Invalidate group members list to reflect changes
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(orgId, groupId, {}),
      });

      // Invalidate the user groups as they might have changed
      for (const userId of memberIds) {
        queryClient.invalidateQueries({
          queryKey: userKeys.groups(orgId, userId),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to remove group members:', error);
    },
  });
  return {
    removeGroupMembers: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

// Optional: Export the API client instance for direct use if needed
export { apiClient };
