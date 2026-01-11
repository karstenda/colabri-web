import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Api,
  OrganizationSetting,
  OrganizationSettingsKey,
  UpdateOrganizationSettingRequest,
} from '../../../api/ColabriAPI';

const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export const organizationSettingKeys = {
  all: ['organizationSettings'] as const,
  org: (orgId: string) => [...organizationSettingKeys.all, orgId] as const,
  detail: (orgId: string, type: string, key: string) =>
    [...organizationSettingKeys.org(orgId), type, key] as const,
};

type UpdateSettingVariables = {
  type: 'user-feature' | 'app-feature' | 'user-setting' | 'app-setting';
  key: OrganizationSettingsKey;
  value?: string;
};

export const useOrganizationSetting = (
  orgId: string,
  type: 'user-feature' | 'app-feature' | 'user-setting' | 'app-setting',
  key: OrganizationSettingsKey,
  enabled = true,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: organizationSettingKeys.detail(orgId, type, key),
    queryFn: () => apiClient.orgId.getSetting(orgId, type, key),
    enabled: enabled && !!orgId && !!key,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const setting: OrganizationSetting | null = data?.data ?? null;

  return { setting, isLoading, error, refetch };
};

export const useUpdateOrganizationSetting = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ type, key, value }: UpdateSettingVariables) =>
      apiClient.orgId.putSetting(orgId, type, key, { value }),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        organizationSettingKeys.detail(orgId, variables.type, variables.key),
        response,
      );
      queryClient.invalidateQueries({
        queryKey: organizationSettingKeys.org(orgId),
      });
    },
    onError: (error) => {
      console.error('Failed to update organization setting:', error);
    },
  });

  return {
    updateOrganizationSetting: mutation.mutateAsync,
    updatedSetting: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export { apiClient };
