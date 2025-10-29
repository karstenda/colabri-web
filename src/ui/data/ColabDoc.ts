import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import type { ColabDoc } from '../../editor/data/ColabDoc';

export async function getMany({
  paginationModel,
  filterModel,
  sortModel,
}: {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}): Promise<{ items: ColabDoc[]; itemCount: number }> {

    // TODO
    console.log('getMany executed with:', { paginationModel, filterModel, sortModel });
 
    return {
        items: [],
        itemCount: 0,
    };
}


export async function deleteOne(colabDocId: number) {

    // TODO
    console.log('deleteOne executed with:', { colabDocId });

    return;

}