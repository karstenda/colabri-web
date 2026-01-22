import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { gray } from '../../../shared-theme/themePrimitives';
import { Typography, TypographyProps } from '@mui/material';

export const EditorWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.default,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export const EditorHeaderWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  flexGrow: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

export const EditorTopHeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  flexGrow: 1,
  width: '100%',
  height: '40px',
  borderRadius: '20px',
}));

export const EditorToolbarWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.grey[100],
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
  width: '100%',
  height: '40px',
  borderRadius: '20px',
  ...theme.applyStyles('dark', {
    background: gray[700],
  }),
}));

export const EditorTopHeaderLeftStack = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const EditorTopHeaderRightStack = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: '0px',
  gap: theme.spacing(1),
}));

export const EditorContentWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.paper,
  display: 'flex',
  flexDirection: 'row',
  flexGrow: 1,
  overflowY: 'auto',
}));

export const EditorContentMainColumn = styled(Box)(({}) => ({
  width: '100%',
}));

export const EditorContentBlockTrack = styled(Box)(({}) => ({
  paddingLeft: '50px',
  paddingRight: '10px',
  paddingBottom: '20px',
  paddingTop: '20px',
  width: '100%',
  alignItems: 'center',
}));

const TypographyDocName = (
  props: Omit<TypographyProps<'div'>, 'component'>,
) => <Typography {...props} component="div" />;
export const DocNameHeader = styled(TypographyDocName)(({ theme }) => ({
  maxWidth: '200px',
  textWrap: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}));

export const DocumentTypeLabel = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.grey[200],
  color: (theme.vars || theme).palette.text.secondary,
  padding: theme.spacing(0.5, 1),
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  maxWidth: '100px',
  textWrap: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}));

export const EditorContentBlock = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  borderRadius: '6px',
}));
