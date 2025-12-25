import React, { PropsWithChildren } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth/useUserAuth';
import { Box, Stack, styled, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import useMediaQuery from '@mui/material/useMediaQuery';
import ColabriSvgIcon from '../../components/MainLayout/icons/ColabriSvgIcon';
import ThemeSwitcher from '../../components/ThemeSwitcher/ThemeSwitcher';
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu';

const MainFrame: React.FC<PropsWithChildren> = ({ children }) => {
  const { isLoading, userAuth, error } = useUserAuth();
  const compactView = useMediaQuery('(max-width:600px)');

  const hasUserSession = !isLoading && userAuth && userAuth.uid !== '';

  // Customize AppBar and LogoContainer here to avoid importing MainHeader but still have consistent look
  const AppBar = styled(MuiAppBar)(({ theme }) => ({
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: (theme.vars ?? theme).palette.divider,
    boxShadow: 'none',
    zIndex: theme.zIndex.drawer + 1,
  }));

  const LogoContainer = styled('div')({
    position: 'relative',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    '& img': {
      maxHeight: 40,
    },
  });

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
      }}
    >
      <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
        <Toolbar sx={{ backgroundColor: 'inherit', mx: { xs: -0.75, sm: -1 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <Stack direction="row" alignItems="center">
              <LogoContainer>
                <ColabriSvgIcon expanded={true} />
              </LogoContainer>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ marginLeft: 'auto' }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <ThemeSwitcher />
                {hasUserSession && <ProfileMenu />}
              </Stack>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          padding: (theme) => theme.spacing(2),
          overflowY: 'auto',
          paddingTop: (theme) =>
            `calc(${theme.spacing(2)} + ${compactView ? 48 : 64}px)`, // Increased to account for AppBar + spacing
          boxSizing: 'border-box',
          '& > *': {
            margin: 'auto',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
export default MainFrame;
