import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Select,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  CardActionArea,
} from '@mui/material';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import type {
  ColabSheetBlockType,
  OrgContentLanguage,
} from '../../../api/ColabriAPI';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';

export interface AddBlockModalPayload {}

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
  ) => {
    return (
      <Card
        variant="outlined"
        onClick={() => handleChange(type)}
        sx={{
          cursor: 'pointer',
          borderColor: selectedBlockType === type ? 'primary.main' : 'grey.300',
          width: 200,
        }}
      >
        <CardActionArea>
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
          <Stack direction={'row'} spacing={4}>
            {getBlockCard(
              'text' as ColabSheetBlockType,
              t('editor.sheetTextBlock.name'),
              t('editor.sheetTextBlock.description'),
            )}
            {getBlockCard(
              'statement-grid' as ColabSheetBlockType,
              t('editor.sheetStatementGridBlock.name'),
              t('editor.sheetStatementGridBlock.description'),
            )}
          </Stack>
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
