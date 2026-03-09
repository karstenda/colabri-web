import { ContainerID, LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabLoroDoc';
import CellWrapper from '../CellWrapper/CellWrapper';
import { Skeleton, TextField } from '@mui/material';
import { ColabGridEditorTableRow } from '../../data/ColabGridEditorTableRow';
import { ConnectedSheetDoc } from '../../../../data/ColabDoc';
import SheetDocController from '../../../../controllers/SheetDocController';
import { useEffect, useState } from 'react';

export type InstanceCellProps = {
  controller: SheetDocController;
  rowId: ContainerID;
  hasFocus: boolean;
  canManage?: boolean;
  canAdd?: boolean;
  readOnly?: boolean;
};

const InstanceCell = ({
  controller,
  rowId,
  hasFocus,
  canManage,
  canAdd,
  readOnly,
}: InstanceCellProps) => {
  // Get the instance value for this row from the controller.
  const [instance, setInstance] = useState<number | null>(() =>
    controller.getGridBlockRowInstance(rowId),
  );

  // Calculate whether we can edit this cell based on permissions and readOnly status.
  const noPermission = !canManage && !canAdd;
  const editable = !readOnly && !noPermission;

  // Listen for changes to the instance value in the controller and update the cell accordingly.
  useEffect(() => {
    // Initialize the right value
    setInstance(controller.getGridBlockRowInstance(rowId));
    // Subscribe to changes to the instance value.
    const unsubscribe = controller.subscribeToFieldChanges(
      rowId,
      'instance',
      () => {
        setInstance(controller.getGridBlockRowInstance(rowId));
      },
    );
    return () => {
      unsubscribe();
    };
  }, [controller, rowId]);

  const onLocaleChange = (newInstance: string) => {
    // Try to parse as number
    let instanceNumber: number | null = Number(newInstance);
    try {
      if (isNaN(instanceNumber) || instanceNumber < 0) {
        instanceNumber = null;
      }
    } catch (error) {
      instanceNumber = null;
    }
    // Update
    controller.setGridBlockRowInstance(rowId, instanceNumber);
    controller.commit();
  };

  return (
    <CellWrapper hasFocus={false} editable={false}>
      {!editable && <>{instance}</>}
      {editable && (
        <TextField
          slotProps={{ htmlInput: { type: 'number' } }}
          value={instance}
          size="small"
          onChange={(event) => onLocaleChange(event.target.value)}
        />
      )}
    </CellWrapper>
  );
};

export default InstanceCell;
