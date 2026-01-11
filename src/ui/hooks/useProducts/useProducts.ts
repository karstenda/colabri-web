import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Api,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../../api/ColabriAPI';

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

// Query keys factory for products
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (orgId: string) => [...productKeys.lists(), orgId] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (orgId: string, productId: string) =>
    [...productKeys.details(), orgId, productId] as const,
};

// Custom hooks for product operations

/**
 * Hook to fetch a list of products in an organization
 */
export const useProducts = (orgId: string, enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: productKeys.list(orgId),
    queryFn: () => apiClient.orgId.getProducts(orgId),
    enabled: enabled && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { products: data?.data || [], isLoading, error, refetch };
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (
  orgId: string,
  productId: string,
  enabled = true,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: productKeys.detail(orgId, productId),
    queryFn: () => apiClient.orgId.getProduct(orgId, productId),
    enabled: enabled && !!orgId && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return { product: data?.data || null, isLoading, error, refetch };
};

/**
 * Hook to create a new product
 */
export const useCreateProduct = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateProductRequest) =>
      apiClient.orgId.postProduct(orgId, data),
    onSuccess: (newProduct) => {
      const { data } = newProduct;

      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Optionally add the new product to the cache
      if (data && data.id) {
        queryClient.setQueryData(
          productKeys.detail(orgId, data.id),
          newProduct,
        );
      }
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    createdProduct: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to update an existing product
 */
export const useUpdateProduct = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductRequest;
    }) => apiClient.orgId.putProduct(orgId, productId, data),
    onSuccess: (updatedProduct, variables) => {
      const { productId } = variables;

      // Update the specific product in cache
      queryClient.setQueryData(
        productKeys.detail(orgId, productId),
        updatedProduct,
      );

      // Invalidate products list to reflect changes
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
    },
  });

  return {
    updateProduct: mutation.mutateAsync,
    updatedProduct: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (productId: string) =>
      apiClient.orgId.deleteProduct(orgId, productId),
    onSuccess: (deletedProduct, productId) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Remove the detail from cache
      queryClient.removeQueries({
        queryKey: productKeys.detail(orgId, productId),
      });
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });

  return {
    deleteProduct: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
