import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const TypographyReadOnly = styled(Typography)(({ theme }) => ({
  color: (theme.vars || theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    color: (theme.vars || theme).palette.text.secondary,
  }),
}));

export const StmtElementHeaderWrapper = styled(Box)(({ theme }) => ({
  paddingLeft: '8px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  flexGrow: 1,
  width: '100%',
}));

export const StmtElementHeaderLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const StmtElementHeaderRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));
