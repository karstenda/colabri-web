import { styled } from '@mui/material/styles';
import { Accordion, AccordionSummary } from '@mui/material';
import { gray } from '../../../shared-theme/themePrimitives';

export const PermissionChainAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: '#EAEBED',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  ...theme.applyStyles('dark', {
    backgroundColor: '#27292D',
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.divider,
  }),
}));

export const PermissionChainAccordionSummary = styled(AccordionSummary)(
  ({ theme }) => ({
    border: 'none',
    borderRadius: 8,
    '&:hover': { backgroundColor: '#DBDCDD' },
    '&:focus-visible': { backgroundColor: 'transparent' },
    ...theme.applyStyles('dark', {
      '&:hover': { backgroundColor: '#161719' },
    }),
  }),
);
