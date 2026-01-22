import { Box, useTheme } from '@mui/material';

export type CellWrapperProps = {
  padding?: string;
  children: React.ReactNode;
  editable?: boolean;
  hasFocus?: boolean;
};

const CellWrapper = ({
  padding,
  children,
  editable,
  hasFocus,
}: CellWrapperProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        paddingLeft: padding ? padding : '10px',
        paddingRight: padding ? padding : '10px',
        paddingTop: padding ? padding : '8px',
        paddingBottom: padding ? padding : '8px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: editable
          ? (theme.vars || theme).palette.background.default
          : (theme.vars || theme).palette.background.paper,
        border: `1px solid ${
          hasFocus ? theme.palette.primary.main : 'transparent'
        }`,
      }}
    >
      {children}
    </Box>
  );
};
export default CellWrapper;
