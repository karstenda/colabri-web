import CellWrapper from '../../../ColabGridEditor/cells/CellWrapper/CellWrapper';
import { BarcodeDataLoro } from '../../../../data/ColabLoroDoc';
import { useEffect, useRef, useState } from 'react';
import SheetDocController from '../../../../controllers/SheetDocController';
import { Box, Tooltip, Typography } from '@mui/material';
import { useColorScheme } from '../../../../../ui/hooks/useColorScheme/useColorScheme';

export type BarcodePreviewCellProps = {
  controller: SheetDocController;
  barcode: BarcodeDataLoro;
  hasFocus: boolean;
};

const BarcodePreviewCell = ({
  controller,
  barcode,
  hasFocus,
}: BarcodePreviewCellProps) => {
  const { mode } = useColorScheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeType, setBarcodeType] = useState<string>(
    () => barcode.get('type') || '',
  );
  const [barcodeData, setBarcodeData] = useState<string>(
    () => barcode.get('data') || '',
  );
  const [symbolComponentCode, setSymbolComponentCode] = useState<string>(
    () => barcode.get('symbolComponentCode') || '',
  );
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    setBarcodeType(barcode.get('type') || '');
    setBarcodeData(barcode.get('data') || '');
    setSymbolComponentCode(barcode.get('symbolComponentCode') || '');

    const unsubType = controller.subscribeToFieldChanges(
      barcode.id,
      'type',
      () => setBarcodeType(barcode.get('type') || ''),
    );
    const unsubData = controller.subscribeToFieldChanges(
      barcode.id,
      'data',
      () => setBarcodeData(barcode.get('data') || ''),
    );
    const unsubSymbolComponentCode = controller.subscribeToFieldChanges(
      barcode.id,
      'symbolComponentCode',
      () => setSymbolComponentCode(barcode.get('symbolComponentCode') || ''),
    );

    return () => {
      unsubType();
      unsubData();
      unsubSymbolComponentCode();
    };
  }, [controller, barcode]);

  useEffect(() => {
    if (!canvasRef.current || !barcodeType || !barcodeData) {
      setRenderError(null);
      return;
    }

    let cancelled = false;

    import('@bwip-js/browser').then((bwipjs) => {
      if (cancelled || !canvasRef.current) return;
      try {
        bwipjs.default.toCanvas(canvasRef.current, {
          bcid: barcodeType,
          text: barcodeData,
          scale: 5,
          includetext: true,
          textxalign: 'center',
        });
        setRenderError(null);
      } catch (e) {
        setRenderError((e as Error).message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [barcodeType, barcodeData, symbolComponentCode]);

  return (
    <CellWrapper>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {barcodeType && barcodeData ? (
          renderError ? (
            <Tooltip title={renderError.split(': ')[0] || ''} arrow>
              <Box
                sx={{
                  fontSize: '0.75rem',
                  color: 'red',
                }}
              >
                {renderError.includes(': ')
                  ? renderError.substring(renderError.indexOf(': ') + 2)
                  : renderError}
              </Box>
            </Tooltip>
          ) : null
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
        <canvas
          ref={canvasRef}
          style={{
            width: '180px',
            height: '180px',
            objectFit: 'contain',
            filter: mode === 'dark' ? 'invert(1)' : undefined,
            display:
              barcodeType && barcodeData && !renderError ? 'block' : 'none',
          }}
        />
      </Box>
    </CellWrapper>
  );
};

export default BarcodePreviewCell;
