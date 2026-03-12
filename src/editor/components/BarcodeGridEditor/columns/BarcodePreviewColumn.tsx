import { TFunction } from 'i18next';
import { BarcodeGridEditorTableRow } from '../BarcodeGridEditorTable';
import BarcodePreviewCell from '../cells/BarcodePreviewCell/BarcodePreviewCell';
import SheetDocController from '../../../controllers/SheetDocController';

const getBarcodePreviewColumn = (
  t: TFunction,
  controller: SheetDocController,
) => ({
  field: 'preview',
  headerName: t('editor.sheetBarcodeGridBlock.preview'),
  width: 200,
  sortable: false,
  filterable: false,
  renderCell: (data: { row: BarcodeGridEditorTableRow; hasFocus: boolean }) => {
    const row = data.row;
    if (!row.barcode) return <>—</>;

    return (
      <BarcodePreviewCell
        controller={controller}
        barcode={row.barcode}
        hasFocus={data.hasFocus}
      />
    );
  },
});

export default getBarcodePreviewColumn;
