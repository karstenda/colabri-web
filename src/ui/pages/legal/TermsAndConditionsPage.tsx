import React from 'react';
import { Box } from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import MainFrame from '../../components/MainLayout/MainFrame';

const termsAndConditionsSrc = new URL(
  '../../../static/terms_and_conditions.html',
  import.meta.url,
).toString();

const TermsAndConditionsPage: React.FC = () => {
  const { mode } = useColorScheme();
  const theme = useTheme();

  const isDarkMode = mode === 'dark';

  return (
    <MainFrame>
      <Box
        component="iframe"
        src={
          isDarkMode
            ? `${termsAndConditionsSrc}?theme=dark`
            : termsAndConditionsSrc
        }
        title="Terms and Conditions"
        loading="lazy"
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: `1px solid ${(theme.vars || theme).palette.divider}`,
        }}
      />
    </MainFrame>
  );
};

export default TermsAndConditionsPage;
