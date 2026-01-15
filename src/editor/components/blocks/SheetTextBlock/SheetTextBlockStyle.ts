import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const TypographyReadOnly = styled(Typography)(({ theme }) => ({
  color: (theme.vars || theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    color: (theme.vars || theme).palette.text.secondary,
  }),
}));

export const SheetTextBlockHeaderWrapper = styled(Box)(({ theme }) => ({
  paddingLeft: '8px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  flexGrow: 1,
  width: '100%',
}));

export const SheetTextBlockHeaderLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const SheetTextBlockHeaderRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const ColabTextEditorOutline = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'showOutlines',
})<{ showOutlines?: boolean }>(({ theme, showOutlines }) => ({
  padding: '4px',
  border: showOutlines
    ? `1px solid ${(theme.vars || theme).palette.grey[100]}`
    : `1px solid transparent`,
  borderRadius: '4px',
  transition: 'border 0.2s ease-in-out',
  ...theme.applyStyles('dark', {
    border: showOutlines
      ? `1px solid ${(theme.vars || theme).palette.grey[700]}`
      : `1px solid transparent`,
  }),
}));
