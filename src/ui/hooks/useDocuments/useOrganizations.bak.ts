import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api, CreateOrganizationRequest, UpdateOrganizationRequest } from '../../../api/ColabriAPI';

// Create a singleton API client instance
const apiClient = new Api({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  baseApiParams: {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Query keys factory for organizations
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => 
    [...organizationKeys.lists(), filters] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

// Custom hooks for organization operations

/**
 * Hook to fetch a list of organizations with pagination
 */
export const useOrganizations = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: organizationKeys.list(params || {}),
    queryFn: () => apiClient.organizations.organizationsList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Hook to fetch a single organization by ID
 */
export const useOrganization = (organizationId: string, enabled = true) => {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => apiClient.organizations.organizationsDetail(organizationId),
    enabled: enabled && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a new organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => 
      apiClient.organizations.organizationsCreate(data),
    onSuccess: (newOrganization) => {
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      
      // Optionally add the new organization to the cache
      queryClient.setQueryData(
        organizationKeys.detail(newOrganization.data.id!),
        newOrganization
      );
    },
    onError: (error) => {
      console.error('Failed to create organization:', error);
    },
  });
};

/**
 * Hook to update an existing organization
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { 
      organizationId: string; 
      data: UpdateOrganizationRequest 
    }) => apiClient.organizations.organizationsPartialUpdate(organizationId, data),
    onSuccess: (updatedOrganization, variables) => {
      const { organizationId } = variables;
      
      // Update the specific organization in cache
      queryClient.setQueryData(
        organizationKeys.detail(organizationId),
        updatedOrganization
      );
      
      // Invalidate organizations list to reflect changes
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update organization:', error);
    },
  });
};

/**
 * Hook to delete an organization
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { 
      organizationId: string; 
      data: UpdateOrganizationRequest 
    }) => apiClient.organizations.organizationsDelete(organizationId, data),
    onSuccess: (_, variables) => {
      const { organizationId } = variables;
      
      // Remove the organization from cache
      queryClient.removeQueries({ queryKey: organizationKeys.detail(organizationId) });
      
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete organization:', error);
    },
  });
};

// Optional: Export the API client instance for direct use if needed
export { apiClient };
