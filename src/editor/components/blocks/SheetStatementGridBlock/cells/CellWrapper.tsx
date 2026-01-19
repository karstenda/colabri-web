import { Box } from '@mui/material';

export type CellWrapperProps = {
  padding?: string;
  children: React.ReactNode;
};

const CellWrapper = ({ padding, children }: CellWrapperProps) => {
  return (
    <Box
      sx={{
        padding: padding ? padding : '8px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  );
};
export default CellWrapper;
