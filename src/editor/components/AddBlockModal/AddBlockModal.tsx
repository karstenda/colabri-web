import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CardActionArea,
  Grid,
} from '@mui/material';
import { ColabSheetBlockType } from '../../../api/ColabriAPI';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import SheetDocController from '../../controllers/SheetDocController';

export interface AddBlockModalPayload {
  controller: SheetDocController;
}

export interface AddBlockModalProps
  extends DialogProps<AddBlockModalPayload, ColabSheetBlockType | undefined> {}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  open,
  onClose,
  payload,
}) => {
  const { t } = useTranslation();
  const [selectedBlockType, setSelectedBlockType] = useState<
    ColabSheetBlockType | undefined
  >(undefined);

  // Check if there is already a properties block
  const controller = payload?.controller;
  const hasPropertiesBlock =
    controller?.getBlocksOfType(
      ColabSheetBlockType.ColabSheetBlockTypeProperties,
    ).length > 0;

  const handleAdd = () => {
    if (selectedBlockType) {
      onClose(selectedBlockType);
      setSelectedBlockType(undefined);
    }
  };

  const handleCancel = () => {
    onClose(undefined);
    setSelectedBlockType(undefined);
  };

  const handleChange = (value: ColabSheetBlockType | null) => {
    setSelectedBlockType(value ?? undefined);
  };

  const getBlockCard = (
    type: ColabSheetBlockType,
    name: string,
    description: string,
    disabled = false,
  ) => {
    return (
      <Card
        variant="outlined"
        onClick={() => !disabled && handleChange(type)}
        sx={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: selectedBlockType === type ? 'primary.main' : 'grey.300',
          width: '100%',
          padding: 0,
        }}
      >
        <CardActionArea
          disabled={disabled}
          sx={{ height: '100%', width: '100%', padding: '12px' }}
        >
          <CardContent>
            <Typography variant="h5" component="div">
              {name}
            </Typography>
            <Typography variant="body2" component="div">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('editor.addBlockModal.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              {getBlockCard(
                'properties' as ColabSheetBlockType,
                t('editor.sheetPropertiesBlock.name'),
                t('editor.sheetPropertiesBlock.description'),
                hasPropertiesBlock,
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              {getBlockCard(
                'text' as ColabSheetBlockType,
                t('editor.sheetTextBlock.name'),
                t('editor.sheetTextBlock.description'),
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              {getBlockCard(
                'statement-grid' as ColabSheetBlockType,
                t('editor.sheetStatementGridBlock.name'),
                t('editor.sheetStatementGridBlock.description'),
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              {getBlockCard(
                'attributes' as ColabSheetBlockType,
                t('editor.sheetAttributesBlock.name'),
                t('editor.sheetAttributesBlock.description'),
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedBlockType}
        >
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBlockModal;
