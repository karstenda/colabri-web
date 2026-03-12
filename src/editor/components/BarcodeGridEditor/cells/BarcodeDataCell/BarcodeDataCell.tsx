import CellWrapper from '../../../ColabGridEditor/cells/CellWrapper/CellWrapper';
import { BarcodeDataLoro } from '../../../../data/ColabLoroDoc';
import { useEffect, useState } from 'react';
import SheetDocController from '../../../../controllers/SheetDocController';
import {
  Autocomplete,
  FormControl,
  InputLabel,
  TextField,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BARCODE_TYPES } from '../../data/BarcodeTypes';

export type BarcodeDataCellProps = {
  controller: SheetDocController;
  barcode: BarcodeDataLoro;
  hasFocus: boolean;
  canApprove?: boolean;
  canEdit?: boolean;
  readOnly?: boolean;
};

const BarcodeDataCell = ({
  controller,
  barcode,
  hasFocus,
  canEdit,
  canApprove,
  readOnly,
}: BarcodeDataCellProps) => {
  const { t } = useTranslation();

  const [barcodeType, setBarcodeType] = useState<string>(
    () => barcode.get('type') || '',
  );

  const [barcodeData, setBarcodeData] = useState<string>(
    () => barcode.get('data') || '',
  );

  const [barcodeSymbolComponentCode, setBarcodeSymbolComponentCode] =
    useState<string>(() => barcode.get('symbolComponentCode') || '');

  const noPermission = !canEdit && !canApprove;
  const editable = !readOnly && !noPermission;

  // Lookup the type in BARCODE_TYPES to determine if we should show the symbolComponentCode field
  const barcodeTypeInfo = BARCODE_TYPES.find((t) => t.type === barcodeType);
  const showSymbolComponentCodeField =
    barcodeTypeInfo?.supportSymbolComponentCode;

  useEffect(() => {
    setBarcodeData(barcode.get('data') || '');
    setBarcodeType(barcode.get('type') || '');
    setBarcodeSymbolComponentCode(barcode.get('symbolComponentCode') || '');

    const unsubData = controller.subscribeToFieldChanges(
      barcode.id,
      'data',
      () => setBarcodeData(barcode.get('data') || ''),
    );
    const unsubType = controller.subscribeToFieldChanges(
      barcode.id,
      'type',
      () => setBarcodeType(barcode.get('type') || ''),
    );
    const unsubSymbolComponentCode = controller.subscribeToFieldChanges(
      barcode.id,
      'symbolComponentCode',
      () =>
        setBarcodeSymbolComponentCode(barcode.get('symbolComponentCode') || ''),
    );

    return () => {
      unsubData();
      unsubType();
      unsubSymbolComponentCode();
    };
  }, [controller, barcode]);

  const handleBarcodeDataChange = (newValue: string) => {
    // Update local state for immediate UI feedback
    setBarcodeData(newValue);
    // Update the Loro document
    barcode.set('data', newValue);
    controller.commit();
  };

  const handleBarcodeTypeChange = (newValue: string) => {
    // Update local state for immediate UI feedback
    setBarcodeType(newValue);
    // Update the Loro document
    barcode.set('type', newValue);
    controller.commit();
  };

  const handleBarcodeSymbolComponentCodeChange = (newValue: string) => {
    // Update local state for immediate UI feedback
    setBarcodeSymbolComponentCode(newValue);
    // Update the Loro document
    barcode.set('symbolComponentCode', newValue);
    controller.commit();
  };

  return (
    <CellWrapper hasFocus={false} editable={false}>
      <Stack
        direction="column"
        gap={2}
        sx={{
          paddingTop: 1,
          paddingBottom: 1,
          width: '100%',
        }}
      >
        <Autocomplete
          options={BARCODE_TYPES}
          getOptionLabel={(option) => option.description}
          value={BARCODE_TYPES.find((t) => t.type === barcodeType) || null}
          disabled={!editable}
          size="small"
          fullWidth
          onChange={(_e, newValue) =>
            handleBarcodeTypeChange(newValue?.type || '')
          }
          renderInput={(params) => (
            <TextField {...params} label={t('barcodes.barcodeType')} />
          )}
        />
        <FormControl fullWidth>
          <InputLabel id="barcode-data-label">
            {t('barcodes.barcodeData')}
          </InputLabel>
          <TextField
            value={barcodeData}
            size="small"
            fullWidth
            disabled={!editable}
            onChange={(e) => handleBarcodeDataChange(e.target.value)}
          />
        </FormControl>
        {showSymbolComponentCodeField && (
          <FormControl fullWidth>
            <InputLabel id="barcode-symbol-component-code-label">
              {t('barcodes.symbolComponentCode')}
            </InputLabel>
            <TextField
              value={barcodeSymbolComponentCode}
              size="small"
              fullWidth
              disabled={!editable}
              onChange={(e) =>
                handleBarcodeSymbolComponentCodeChange(e.target.value)
              }
            />
          </FormControl>
        )}
      </Stack>
    </CellWrapper>
  );
};

export default BarcodeDataCell;
