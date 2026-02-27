import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Api, ExportAcrGS1Request } from '../../../api/ColabriAPI';

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
 * Hook to export a sheet to GS1 XML
 */
export const useExportGS1XML = (orgId: string, docId: string) => {
  const mutation = useMutation({
    mutationFn: (data: ExportAcrGS1Request) =>
      apiClient.orgId.postExportGs1AcrXml(orgId, docId, data, {
        format: 'text',
      }),
    onError: (error) => {
      console.error('Failed to export GS1 XML:', error);
    },
  });
  return {
    exportGS1XML: mutation.mutateAsync,
    gs1XML: mutation.data?.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
