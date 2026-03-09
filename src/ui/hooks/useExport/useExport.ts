import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Api,
  ExportAcrGS1Request,
  ExportDocxRequest,
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

/**
 * Hook to export a sheet to GS1 XML
 */
export const useExportGS1XML = (orgId: string, docId: string) => {
  const mutation = useMutation({
    mutationFn: async (data: ExportAcrGS1Request) => {
      const response = await apiClient.orgId.postExportGs1AcrXml(
        orgId,
        docId,
        data,
      );
      if (response.ok) {
        return await response.text(); // XML string
      } else {
        const error = await response.json();
        throw error;
      }
    },
    onError: (error) => {
      console.error('Failed to export GS1 XML:', error);
    },
  });
  return {
    exportGS1XML: mutation.mutateAsync,
    gs1XML: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to export a sheet to MS Word DOCX
 */
export const useExportDocx = (orgId: string, docId: string) => {
  const mutation = useMutation({
    mutationFn: async (data: ExportDocxRequest) => {
      const response = await apiClient.orgId.postExportDocx(orgId, docId, data);
      if (response.ok) {
        return await response.blob(); // DOCX bytes
      } else {
        const error = await response.json();
        throw error;
      }
    },
    onError: (error) => {
      console.error('Failed to export DOCX:', error);
    },
  });
  return {
    exportDocx: mutation.mutateAsync,
    docx: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
