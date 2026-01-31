import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import {
  ManageModalPayload,
  ManageSheetBlockModalPayload,
  ManageSheetModalPayload,
  ManageSheetStatementElementModalPayload,
  ManageSheetStatementModalPayload,
  ManageStatementElementModalPayload,
  ManageStatementModalPayload,
} from './ManageModalPayloads';
import ManageStatementDocPanel from './ManageStatementDocPanel';
import ManageSheetDocPanel from './ManageSheetDocPanel';
import ManageStatementElementPanel from './ManageStatementElementPanel';
import ManageSheetBlockPanel from './ManageSheetBlockPanel';
import ManageSheetStatementElementPanel from './ManageSheetStatementElementPanel';
import ManageSheetStatementPanel from './ManageSheetStatementPanel';

export interface ManageModalProps
  extends DialogProps<ManageModalPayload, void> {}

const ManageModal = ({ open, payload, onClose }: ManageModalProps) => {
  const { t } = useTranslation();

  // Extract the payload
  const type = payload.type;
  const title = payload.title || null;

  const handleClose = async () => {
    await onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!title && <DialogTitle>{t('common.manage')}</DialogTitle>}
      {title && <DialogTitle>{title}</DialogTitle>}
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Box>
          {type === 'statement' && (
            <ManageStatementDocPanel
              docController={
                (payload as ManageStatementModalPayload).stmtDocController
              }
              readOnly={payload.readOnly}
            />
          )}
          {type === 'sheet' && (
            <ManageSheetDocPanel
              docController={
                (payload as ManageSheetModalPayload).sheetDocController
              }
              readOnly={payload.readOnly}
            />
          )}
          {type === 'statement-element' && (
            <ManageStatementElementPanel
              docController={
                (payload as ManageStatementElementModalPayload)
                  .stmtDocController
              }
              langCode={
                (payload as ManageStatementElementModalPayload).langCode
              }
              readOnly={payload.readOnly}
            />
          )}
          {type === 'sheet-block' && (
            <ManageSheetBlockPanel
              docController={
                (payload as ManageSheetBlockModalPayload).sheetDocController
              }
              blockId={
                (payload as ManageSheetBlockModalPayload).blockContainerId
              }
              readOnly={payload.readOnly}
            />
          )}
          {type === 'sheet-statement' && (
            <ManageSheetStatementPanel
              docController={
                (payload as ManageSheetStatementModalPayload).stmtDocController
              }
              blockId={
                (payload as ManageSheetStatementModalPayload).blockContainerId
              }
              readOnly={payload.readOnly}
            />
          )}
          {type === 'sheet-statement-element' && (
            <ManageSheetStatementElementPanel
              docController={
                (payload as ManageSheetStatementElementModalPayload)
                  .stmtDocController
              }
              blockId={
                (payload as ManageSheetStatementElementModalPayload)
                  .blockContainerId
              }
              langCode={
                (payload as ManageSheetStatementElementModalPayload).langCode
              }
              readOnly={payload.readOnly}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ManageModal;
