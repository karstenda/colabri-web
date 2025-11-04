import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api, CreateUserRequest, UpdateUserRequest } from '../../../api/ColabriAPI';

// Create a singleton API client instance
const apiClient = new Api({
  baseUrl: "/api/v1",
  baseApiParams: {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Query keys factory for users
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (orgId: string, filters: { limit?: number; offset?: number }) => 
    [...userKeys.lists(), orgId, filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (orgId: string, userId: string) => [...userKeys.details(), orgId, userId] as const,
  groups: (orgId: string, userId: string) => [...userKeys.details(), orgId, userId, 'groups'] as const,
};

// Custom hooks for user operations

/**
 * Hook to fetch a list of users in an organization with pagination
 */
export const useUsers = (orgId: string, params?: { limit?: number; offset?: number }) => {
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: userKeys.list(orgId, params || {}),
    queryFn: () => apiClient.orgId.getUsers(orgId, params),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
  return {users: data?.data || [], isLoading, error, refetch};
};

/**
 * Hook to fetch a single user by ID
 */
export const useUser = (orgId: string, userId: string, enabled = true) => {
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: userKeys.detail(orgId, userId),
    queryFn: () => apiClient.orgId.getUser(orgId, userId),
    enabled: enabled && !!orgId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return {user: data?.data || null, isLoading, error, refetch};
};

/**
 * Hook to create a new user
 */
export const useCreateUser = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateUserRequest) => 
      apiClient.orgId.postUser(orgId, data),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Optionally add the new user to the cache
      queryClient.setQueryData(
        userKeys.detail(orgId, newUser.data.id!),
        newUser
      );
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });

  return {
    createUser: mutation.mutateAsync,
    createdUser: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, data }: { 
      userId: string; 
      data: UpdateUserRequest 
    }) => apiClient.orgId.patchUser(orgId, userId, data),
    onSuccess: (updatedUser, variables) => {
      const { userId } = variables;
      
      // Update the specific user in cache
      queryClient.setQueryData(
        userKeys.detail(orgId, userId),
        updatedUser
      );
      
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });

  return { 
    updateUser: mutation.mutateAsync,
    updatedUser: mutation.data, 
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userId: string) => 
      apiClient.orgId.deleteUser(orgId, userId),
    onSuccess: (_, userId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(orgId, userId) });
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    deletedUser: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error
  };
};

export const useUserGroups = (orgId: string, userId: string, enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: userKeys.groups(orgId, userId),
    queryFn: () => apiClient.orgId.getUsersGroups(orgId, userId),
    enabled: enabled && !!orgId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { userGroups: data?.data || [], isLoading, error, refetch };
};

// Optional: Export the API client instance for direct use if needed
export { apiClient };
