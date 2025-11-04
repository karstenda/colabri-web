
export type GridListFilterItem = {
    id: string;
    field: string;
    operator: string;
    value?: string;
};

export type GridListFilterModel = {
    items: GridListFilterItem[];
    logicOperator: 'and' | 'or';
    quickFilterValues?: any[];
    quickFilterLogicOperator?: 'and' | 'or';
    quickFilterFields?: string[];
};

export type GridListSortModel = GridListSortItem[];

export type GridListSortItem = {
    field: string;
    direction: 'asc' | 'desc';
}