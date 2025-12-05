import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { gray } from '../../../shared-theme/themePrimitives';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export const PermissionEditorTable = styled(Table)(({}) => ({
  margin: 0,
  width: '100%',
  tableLayout: 'fixed',
}));

export const PermissionEditorDivider = styled(Divider)(({ theme }) => ({
  borderColor: (theme.vars || theme).palette.divider,
  ...theme.applyStyles('dark', {
    borderColor: gray[600],
  }),
}));

export const PermissionEditorTableRow = styled(TableRow)(({}) => ({
  padding: 0,
}));

export const PermissionEditorTableCellLeft = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  paddingLeft: 0,
  width: '60%',
  border: '0px',
}));

export const PermissionEditorTableCellRight = styled(TableCell)(
  ({ theme }) => ({
    padding: theme.spacing(1),
    paddingRight: 0,
    width: '40%',
    border: '0px',
  }),
);
