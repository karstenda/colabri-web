import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { IconButton, Stack } from '@mui/material';

export const ControlsBox = styled(Box)(({}) => ({
  position: 'absolute',
  left: '-40px',
  top: '0px',
}));

export const ControlsBar = styled(Stack)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.grey[100],
  borderRadius: '14px',
  width: '28px',
  ...theme.applyStyles('dark', {
    background: (theme.vars || theme).palette.grey[700],
  }),
}));

export const ControlButton = styled(IconButton)(({}) => ({
  height: '28px',
  width: '28px',
}));
