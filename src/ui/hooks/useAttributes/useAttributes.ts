import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api, CreateAttributeRequest, CreateAttributeValueRequest, UpdateAttributeValueRequest } from '../../../api/ColabriAPI';

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

// Query keys factory for attributes
export const attributeKeys = {
	all: ['attributes'] as const,
	lists: () => [...attributeKeys.all, 'list'] as const,
	list: (orgId: string) => [...attributeKeys.lists(), orgId] as const,
	details: () => [...attributeKeys.all, 'detail'] as const,
	detail: (orgId: string, attributeId: string) => [...attributeKeys.details(), orgId, attributeId] as const,
	documentValues: (orgId: string, docId: string) => [...attributeKeys.all, 'document-values', orgId, docId] as const,
};

// Custom hooks for attribute operations

/**
 * Hook to fetch a list of attributes in an organization
 */
export const useAttributes = (orgId: string, enabled = true) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: attributeKeys.list(orgId),
		queryFn: () => apiClient.orgId.getAttributes(orgId),
		enabled: enabled && !!orgId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
	return { attributes: data?.data || [], isLoading, error, refetch };
};

/**
 * Hook to fetch a single attribute by ID
 */
export const useAttribute = (orgId: string, attributeId: string, enabled = true) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: attributeKeys.detail(orgId, attributeId),
		queryFn: async () => {
			// Fetch all attributes and find the one we need
			// This is a workaround since there's no single attribute endpoint
			const response = await apiClient.orgId.getAttributes(orgId);
			const attribute = response.data.find(attr => attr.id === attributeId);
			if (!attribute) {
				throw new Error('Attribute not found');
			}
			return attribute;
		},
		enabled: enabled && !!orgId && !!attributeId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
	return { attribute: data, isLoading, error, refetch };
};

/**
 * Hook to create a new attribute
 */
export const useCreateAttribute = (orgId: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: CreateAttributeRequest) => apiClient.orgId.postAttribute(orgId, data),
		onSuccess: () => {
			// Invalidate and refetch attributes list
			queryClient.invalidateQueries({ queryKey: attributeKeys.lists() });
		},
		onError: (error) => {
			console.error('Failed to create attribute:', error);
		},
	});
	return {
		createAttribute: mutation.mutateAsync,
		createdAttribute: mutation.data,
		isPending: mutation.isPending,
		error: mutation.error
	};
};

/**
 * Hook to update an existing attribute
 */
export const useUpdateAttribute = (orgId: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({ attributeId, data }: { attributeId: string; data: CreateAttributeRequest }) =>
			apiClient.orgId.patchAttribute(orgId, attributeId, data),
		onSuccess: () => {
			// Invalidate attributes list to reflect changes
			queryClient.invalidateQueries({ queryKey: attributeKeys.lists() });
		},
		onError: (error) => {
			console.error('Failed to update attribute:', error);
		},
	});
	return {
		updateAttribute: mutation.mutateAsync,
		updatedAttribute: mutation.data,
		isPending: mutation.isPending,
		error: mutation.error
	};
};

/**
 * Hook to delete an attribute
 */
export const useDeleteAttribute = (orgId: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (attributeId: string) => apiClient.orgId.deleteAttribute(orgId, attributeId),
		onSuccess: () => {
			// Invalidate attributes list
			queryClient.invalidateQueries({ queryKey: attributeKeys.lists() });
		},
		onError: (error) => {
			console.error('Failed to delete attribute:', error);
		},
	});
	return {
		deleteAttribute: mutation.mutateAsync,
		deletedAttribute: mutation.data,
		isPending: mutation.isPending,
		error: mutation.error
	};
};

// Attribute values for documents

/**
 * Hook to fetch attribute values for a specific document
 */
export const useDocumentAttributeValues = (orgId: string, docId: string, enabled = true) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: attributeKeys.documentValues(orgId, docId),
		queryFn: () => apiClient.orgId.getDocumentsAttributes(orgId, docId),
		enabled: enabled && !!orgId && !!docId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
	return { attributeValues: data?.data || [], isLoading, error, refetch };
};

/**
 * Hook to create attribute values for a document
 */
export const useCreateDocumentAttributeValues = (orgId: string, docId: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: CreateAttributeValueRequest[]) =>
			apiClient.orgId.postDocumentsAttribute(orgId, docId, data),
		onSuccess: () => {
			// Invalidate the document's attribute values
			queryClient.invalidateQueries({ queryKey: attributeKeys.documentValues(orgId, docId) });
		},
		onError: (error) => {
			console.error('Failed to create attribute values:', error);
		},
	});
	return {
		createAttributeValues: mutation.mutateAsync,
		createdAttributeValues: mutation.data,
		isPending: mutation.isPending,
		error: mutation.error
	};
};

/**
 * Hook to update attribute values for a document
 */
export const useUpdateDocumentAttributeValues = (orgId: string, docId: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: Record<string, UpdateAttributeValueRequest>) =>
			apiClient.orgId.patchDocumentsAttribute(orgId, docId, data),
		onSuccess: () => {
			// Invalidate the document's attribute values
			queryClient.invalidateQueries({ queryKey: attributeKeys.documentValues(orgId, docId) });
		},
		onError: (error) => {
			console.error('Failed to update attribute values:', error);
		},
	});
	return {
		updateAttributeValues: mutation.mutateAsync,
		updatedAttributeValues: mutation.data,
		isPending: mutation.isPending,
		error: mutation.error
	};
};

/**
 * Hook to delete attribute values for a document
 */
export const useDeleteDocumentAttributeValues = (orgId: string, docId: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (attributeValueIds: string[]) =>
			apiClient.orgId.deleteDocumentsAttribute(orgId, docId, attributeValueIds),
		onSuccess: () => {
			// Invalidate the document's attribute values
			queryClient.invalidateQueries({ queryKey: attributeKeys.documentValues(orgId, docId) });
		},
		onError: (error) => {
			console.error('Failed to delete attribute values:', error);
		},
	});
	return {
		deleteAttributeValues: mutation.mutateAsync,
		deletedAttributeValues: mutation.data,
		isPending: mutation.isPending,
		error: mutation.error
	};
};
