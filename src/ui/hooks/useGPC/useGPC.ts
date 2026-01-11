import { useQuery } from '@tanstack/react-query';
import { Api } from '../../../api/ColabriAPI';
import type { GPCNode } from '../../../api/ColabriAPI';

const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export const gpcKeys = {
  all: ['gpc'] as const,
  list: (params: Record<string, any>) => [...gpcKeys.all, params] as const,
};

export interface UseGPCNodesParams {
  queryScope:
    | 'gpcSegment'
    | 'gpcFamily'
    | 'gpcClass'
    | 'gpcBrick'
    | 'gpcAttribute'
    | 'gpcValue';
  gpcSegmentCode?: string;
  gpcFamilyCode?: string;
  gpcClassCode?: string;
  gpcBrickCode?: string;
  gpcAttributeCode?: string;
  gpcValueCode?: string;
  queryValue?: string;
  limit?: number;
  enabled?: boolean;
}

export const useGPCNodes = ({
  enabled = true,
  ...params
}: UseGPCNodesParams) => {
  const queryParams = {
    limit: 50,
    ...params,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: gpcKeys.list(queryParams),
    queryFn: () => apiClient.gpc.getGpc(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  return { nodes: data?.data || [], isLoading, error, refetch };
};
