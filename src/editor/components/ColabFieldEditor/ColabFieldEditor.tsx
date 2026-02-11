import { ContainerID } from 'loro-crdt';
import React, { useState, useEffect } from 'react';
import ColabDocController from '../../controllers/ColabDocController';
import { ColabLoroDoc } from '../../data/ColabLoroDoc';
import Box from '@mui/material/Box';

export type ColabFieldSlotProps = {
  value?: any;
  onChange?: (newValue: any) => void;
};

export type ColabFieldEditorProps<T extends ColabFieldSlotProps> = {
  parentContainerId: ContainerID;
  fieldName: string;
  docController: ColabDocController<ColabLoroDoc>;
  toLoroValue: (input: any) => any;
  fromLoroValue: (stored: any) => any;
  inputSlot: React.JSXElementConstructor<T>;
  inputSlotProps: T;
};

const ColabFieldEditor = <T extends ColabFieldSlotProps>({
  parentContainerId,
  fieldName,
  docController,
  toLoroValue,
  fromLoroValue,
  inputSlot,
  inputSlotProps,
}: ColabFieldEditorProps<T>) => {
  const [fieldValue, setFieldValue] = useState<any>(
    fromLoroValue(docController.getFieldValue(parentContainerId, fieldName)),
  );

  useEffect(() => {
    const unsubscribe = docController.subscribeToFieldChanges(
      parentContainerId,
      fieldName,
      (ev) => {
        setFieldValue(
          fromLoroValue(
            docController.getFieldValue(parentContainerId, fieldName),
          ),
        );
      },
    );
    return () => {
      unsubscribe();
    };
  }, [parentContainerId, fieldName, docController]);

  const handleOnValueChange = (newValue: any) => {
    const loroValue = toLoroValue(newValue);
    docController.setFieldValue(parentContainerId, fieldName, loroValue);
    docController.commit();
    setFieldValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {React.createElement(inputSlot, {
        ...inputSlotProps,
        value: fieldValue,
        onChange: handleOnValueChange,
      })}
    </Box>
  );
};

export default ColabFieldEditor;
