import { useColorScheme as useMuiColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useColorScheme = () => {
  const { mode } = useMuiColorScheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const preferredMode = prefersDarkMode ? 'dark' : 'light';
  const paletteMode = !mode || mode === 'system' ? preferredMode : mode;
  return { mode: paletteMode };
};

export { useColorScheme };
