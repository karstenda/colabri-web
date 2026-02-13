import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Api, DreamSheetRequest } from '../../../api/ColabriAPI';
import { sheetKeys } from '../useSheets/useSheets';

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

/**
 * Hook to create a new sheet
 */
export const useDreamSheet = (orgId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: DreamSheetRequest) =>
      apiClient.orgId.postDreamSheet(orgId, data),
    onSuccess: (newSheet) => {
      const { data } = newSheet;

      // Invalidate and refetch sheets list
      queryClient.invalidateQueries({ queryKey: sheetKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to dream sheet:', error);
    },
  });

  return {
    dreamSheet: mutation.mutateAsync,
    dreamedSheetResponse: mutation.data?.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
