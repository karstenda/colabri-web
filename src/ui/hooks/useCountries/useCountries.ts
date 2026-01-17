import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../../api/ColabriAPI';

const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export const countryKeys = {
  all: ['countries'] as const,
  platform: () => [...countryKeys.all, 'platform'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  list: (orgId: string) => [...countryKeys.lists(), orgId] as const,
};

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_COUNTRIES: never[] = [];
const EMPTY_REFETCH = () => {};

export const usePlatformCountries = (enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: countryKeys.platform(),
    queryFn: () => apiClient.countries.getCountries(),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  return {
    countries: data?.data ?? EMPTY_COUNTRIES,
    isLoading,
    error,
    refetch,
  };
};

export const useCountries = (orgId?: string, enabled = true) => {
  if (!orgId) {
    return {
      countries: EMPTY_COUNTRIES,
      isLoading: false,
      error: null,
      refetch: EMPTY_REFETCH,
    };
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: countryKeys.list(orgId),
    queryFn: () => apiClient.orgId.getCountries(orgId),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  return {
    countries: data?.data ?? EMPTY_COUNTRIES,
    isLoading,
    error,
    refetch,
  };
};

export const useAddCountries = (orgId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (countryCodes: string[]) =>
      apiClient.orgId.postCountrie(orgId, countryCodes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.list(orgId) });
    },
  });

  return {
    addCountries: mutation.mutateAsync,
    addedCountries: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export const useRemoveCountries = (orgId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (countryIds: string[]) =>
      apiClient.orgId.deleteCountrie(orgId, countryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.list(orgId) });
    },
  });

  return {
    removeCountries: mutation.mutateAsync,
    removedCountries: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
