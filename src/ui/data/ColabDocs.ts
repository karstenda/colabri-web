import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { ColabDoc } from '../../editor/data/ColabDoc';

export const INITIAL_COLABDOC_STORE: ColabDoc[] = [
    {
        id: 1,
        name: 'Cruncharooz - Rainbow - Summer 2026',
        author: 'Karsten Daemen',
        state: "draft",
        modifiedOn: '2025-07-16T00:00:00.000Z',
        addedOn: '2025-07-16T00:00:00.000Z'
    },
    {
        id: 2,
        name: 'Honey Loopsies - Fall 2026',
        author: 'Karsten Daemen',
        state: "draft",
        modifiedOn: '2025-07-16T00:00:00.000Z',
        addedOn: '2025-07-16T00:00:00.000Z'
    }
];


export function getColabDocStore(): ColabDoc[] {
  const stringifiedColabDocs = localStorage.getItem('collabdoc-store');
  return stringifiedColabDocs ? JSON.parse(stringifiedColabDocs) : INITIAL_COLABDOC_STORE;
}

export function setColabDocStore(colabDocs: ColabDoc[]) {
  return localStorage.setItem('collabdoc-store', JSON.stringify(colabDocs));
}

export async function getMany({
  paginationModel,
  filterModel,
  sortModel,
}: {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}): Promise<{ items: ColabDoc[]; itemCount: number }> {
  const colabDocsStore = getColabDocStore();

  let filteredColabDocs = [...colabDocsStore];

  // Apply filters (example only)
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, value, operator }) => {
      if (!field || value == null) {
        return;
      }

      filteredColabDocs = filteredColabDocs.filter((colabDoc) => {
        const colabDocValue = colabDoc[field as keyof ColabDoc];

        switch (operator) {
          case 'contains':
            return String(colabDocValue).toLowerCase().includes(String(value).toLowerCase());
          case 'equals':
            return colabDocValue === value;
          case 'startsWith':
            return String(colabDocValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(colabDocValue).toLowerCase().endsWith(String(value).toLowerCase());
          case '>':
            return colabDocValue ? colabDocValue > value : false;
          case '<':
            return colabDocValue ? colabDocValue < value : false;
          default:
            return true;
        }
      });
    });
  }

  // Apply sorting
  if (sortModel?.length) {
    filteredColabDocs.sort((a, b) => {
      for (const { field, sort } of sortModel) {

        let aValue = a[field as keyof ColabDoc];
        let bValue = b[field as keyof ColabDoc];

        if (!aValue) {
            aValue = '';
        }
        if (!bValue) {
            bValue = '';
        }
        
        if (aValue < bValue) {
          return sort === 'asc' ? -1 : 1;
        }
        else if (aValue > bValue) {
          return sort === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
  }

  // Apply pagination
  const start = paginationModel.page * paginationModel.pageSize;
  const end = start + paginationModel.pageSize;
  const paginatedColabDocs = filteredColabDocs.slice(start, end);

  return {
    items: paginatedColabDocs,
    itemCount: filteredColabDocs.length,
  };
}

export async function getOne(colabDocId: number) {
  const colabDocsStore = getColabDocStore();

  const colabDocToShow = colabDocsStore.find((colabDoc) => colabDoc.id === colabDocId);

  if (!colabDocToShow) {
    throw new Error('Document not found');
  }
  return colabDocToShow;
}

export async function createOne(data: Omit<ColabDoc, 'id'>) {
  const colabDocsStore = getColabDocStore();

  const newColabDoc = {
    id: colabDocsStore.reduce((max, colabDoc) => Math.max(max, colabDoc.id), 0) + 1,
    ...data,
  };

  setColabDocStore([...colabDocsStore, newColabDoc]);

  return newColabDoc;
}

export async function updateOne(colabDocId: number, data: Partial<Omit<ColabDoc, 'id'>>) {
  const colabDocsStore = getColabDocStore();

  let updatedColabDoc: ColabDoc | null = null;

  setColabDocStore(
    colabDocsStore.map((colabDoc) => {
      if (colabDoc.id === colabDocId) {
        updatedColabDoc = { ...colabDoc, ...data };
        return updatedColabDoc;
      }
      return colabDoc;
    }),
  );

  if (!updatedColabDoc) {
    throw new Error('Document not found');
  }
  return updatedColabDoc;
}

export async function deleteOne(colabDocId: number) {
  const colabDocsStore = getColabDocStore();

  setColabDocStore(colabDocsStore.filter((colabDoc) => colabDoc.id !== colabDocId));
}

// Validation follows the [Standard Schema](https://standardschema.dev/).

type ValidationResult = { issues: { message: string; path: (keyof ColabDoc)[] }[] };

export function validate(colabDoc: Partial<ColabDoc>): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!colabDoc.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  return { issues };
}
