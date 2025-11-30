import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

export const FormattingButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  height: '28px',
  width: '28px',
  borderRadius: '4px',
  backgroundColor: active
    ? (theme.vars || theme).palette.primary.light
    : 'transparent',
  '&:hover': {
    backgroundColor: active
      ? (theme.vars || theme).palette.primary.light
      : (theme.vars || theme).palette.grey[200],
  },
  ...theme.applyStyles('dark', {
    '&:hover': {
      backgroundColor: active
        ? (theme.vars || theme).palette.primary.light
        : (theme.vars || theme).palette.grey[600],
    },
  }),
}));

export const UndoRedoButton = styled(IconButton)(({ theme }) => ({
  height: '28px',
  width: '28px',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: (theme.vars || theme).palette.grey[200],
  },
  ...theme.applyStyles('dark', {
    '&:hover': {
      backgroundColor: (theme.vars || theme).palette.grey[600],
    },
  }),
}));

export const ToolbarMenuDivider = styled('div')(({ theme }) => ({
  borderColor: (theme.vars || theme).palette.grey[200],
  marginLeft: `${theme.spacing(1)} !important`,
  marginRight: `${theme.spacing(1)} !important`,
  borderLeft: '1px solid',
  alignSelf: 'center',
  height: '24px',
  ...theme.applyStyles('dark', {
    borderColor: (theme.vars || theme).palette.grey[600],
  }),
}));
