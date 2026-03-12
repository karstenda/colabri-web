import { TFunction } from 'i18next';
import { BarcodeGridEditorTableRow } from '../BarcodeGridEditorTable';
import BarcodeDataCell from '../cells/BarcodeDataCell/BarcodeDataCell';
import SheetDocController from '../../../controllers/SheetDocController';

const getBarcodeDataColumn = (
  t: TFunction,
  controller: SheetDocController,
  canEdit?: boolean,
  canApprove?: boolean,
  readOnly?: boolean,
) => ({
  field: 'barcodeData',
  headerName: t('editor.sheetBarcodeGridBlock.data'),
  width: 250,
  minWidth: 200,
  renderCell: (data: { row: BarcodeGridEditorTableRow; hasFocus: boolean }) => {
    const row = data.row;
    if (!row.barcode) return <>—</>;

    return (
      <BarcodeDataCell
        controller={controller}
        barcode={row.barcode}
        hasFocus={data.hasFocus}
        canEdit={canEdit}
        canApprove={canApprove}
        readOnly={readOnly}
      />
    );
  },
});

export default getBarcodeDataColumn;
