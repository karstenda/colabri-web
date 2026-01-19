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

export const StyledDocEditorBlock = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'hasFocus' && prop !== 'isHovered' && prop !== 'readOnly',
})<{ hasFocus?: boolean; isHovered?: boolean; readOnly: boolean }>(
  ({ theme, hasFocus, readOnly }) => ({
    width: '100%',
    maxWidth: '800px',
    backgroundColor: !readOnly
      ? (theme.vars || theme).palette.background.default
      : (theme.vars || theme).palette.background.paper,
    border: `1px solid ${
      hasFocus ? theme.palette.primary.main : theme.palette.divider
    }`,
    padding: theme.spacing(2),
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
  }),
);
