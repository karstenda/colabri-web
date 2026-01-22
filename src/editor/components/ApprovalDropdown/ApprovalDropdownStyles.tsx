import { styled, Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { getApprovalColor } from '../../data/Approval';

export const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  boxShadow: 'none',
}));

export const StatusButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'hasDropdown' && prop !== 'state',
})<{ hasDropdown?: boolean; state?: string }>(
  ({ theme, hasDropdown, state }) => ({
    '&.MuiButton-root': {
      height: '24px',
      paddingLeft: '8px',
      paddingRight: '8px',
      backgroundColor: getApprovalColor(state || '', 'light', false),
      backgroundImage: 'none',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: !hasDropdown
        ? 'none'
        : '1px solid ' + (theme.vars || theme).palette.divider,

      '&:hover': {
        backgroundColor: getApprovalColor(state || '', 'light', true),
      },

      // Dark Mode Overrides
      ...theme.applyStyles('dark', {
        backgroundColor: getApprovalColor(state || '', 'dark', false),
        '&:hover': {
          backgroundColor: getApprovalColor(state || '', 'dark', true),
        },
      }),
    },
  }),
);

export const DropdownButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'state',
})<{ state?: string }>(({ theme, state }) => ({
  '&.MuiButton-root': {
    backgroundColor: getApprovalColor(state || '', 'light', false),
    backgroundImage: 'none',
    height: '24px',
    padding: '0px',
    width: '26px',
    border: 'none !important',
    minWidth: '26px !important',

    '&:hover': {
      backgroundColor: getApprovalColor(state || '', 'light', true),
    },

    // Dark Mode Overrides
    ...theme.applyStyles('dark', {
      backgroundColor: getApprovalColor(state || '', 'dark', false),

      '&:hover': {
        backgroundColor: getApprovalColor(state || '', 'dark', true),
      },
    }),
  },
}));
