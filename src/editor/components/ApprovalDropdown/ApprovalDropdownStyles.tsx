import { styled, Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

export const getApprovalColor = (
  state: string,
  theme: Theme,
  mode: 'light' | 'dark',
  hover: boolean,
) => {
  const isDark = mode === 'dark';
  switch (state) {
    case 'draft':
      if (isDark) return hover ? '#BDBDBD' : '#9E9E9E';
      return hover ? '#BDBDBD' : '#E0E0E0';
    case 'pending':
      if (isDark) return hover ? '#64B5F6' : '#42A5F5';
      return hover ? '#64B5F6' : '#90CAF9';
    case 'approved':
      if (isDark) return hover ? '#81C784' : '#66BB6A';
      return hover ? '#81C784' : '#A5D6A7';
    case 'rejected':
      if (isDark) return hover ? '#E57373' : '#EF5350';
      return hover ? '#E57373' : '#EF9A9A';
    default:
      if (isDark) return hover ? '#BDBDBD' : '#9E9E9E';
      return hover ? '#BDBDBD' : '#E0E0E0';
  }
};

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
      backgroundColor: getApprovalColor(state || '', theme, 'light', false),
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
        backgroundColor: getApprovalColor(state || '', theme, 'light', true),
      },

      // Dark Mode Overrides
      ...theme.applyStyles('dark', {
        backgroundColor: getApprovalColor(state || '', theme, 'dark', false),
        '&:hover': {
          backgroundColor: getApprovalColor(state || '', theme, 'dark', true),
        },
      }),
    },
  }),
);

export const DropdownButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'state',
})<{ state?: string }>(({ theme, state }) => ({
  '&.MuiButton-root': {
    backgroundColor: getApprovalColor(state || '', theme, 'light', false),
    backgroundImage: 'none',
    height: '24px',
    padding: '0px',
    width: '26px',
    border: 'none !important',
    minWidth: '26px !important',

    '&:hover': {
      backgroundColor: getApprovalColor(state || '', theme, 'light', true),
    },

    // Dark Mode Overrides
    ...theme.applyStyles('dark', {
      backgroundColor: getApprovalColor(state || '', theme, 'dark', false),

      '&:hover': {
        backgroundColor: getApprovalColor(state || '', theme, 'dark', true),
      },
    }),
  },
}));
