import { TFunction } from 'i18next';
import { ColabGridEditorTableRow } from '../data/ColabGridEditorTableRow';
import InstanceCell from '../cells/InstanceCell/InstanceCell';
import { ContainerID } from 'loro-crdt';
import SheetDocController from '../../../controllers/SheetDocController';

const getInstanceColumn = (
  t: TFunction,
  controller: SheetDocController,
  canManage?: boolean,
  canAdd?: boolean,
  readOnly?: boolean,
) => ({
  field: 'instance',
  headerName: t('editor.sheetColabGridEditor.instance'),
  width: 80,
  hideable: true,
  renderCell: (data: { row: ColabGridEditorTableRow; hasFocus: boolean }) => {
    const row = data.row as ColabGridEditorTableRow;
    const hasFocus = data.hasFocus;

    return (
      <InstanceCell
        controller={controller}
        rowId={row.id}
        hasFocus={hasFocus}
        readOnly={readOnly}
        canAdd={canAdd}
        canManage={canManage}
      />
    );
  },
});

export default getInstanceColumn;
