import { styled } from '@mui/styles';
import { darkScrollbar, FormControl } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export const theme = (darkModeEnabled: boolean) => createTheme({
  palette: {
    mode: darkModeEnabled ? 'dark' : 'light',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...(darkModeEnabled ? darkScrollbar() : undefined),
          /* prevents bounce on scroll, see https://stackoverflow.com/a/28181319 */
          overflow: 'hidden',
        },
        '#app': {
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          position: 'absolute',
        },
        'svg, symbol': {
          overflow: 'visible',
        },
      },
    },
  },
});

export const FullPageDiv = styled('div')({
  width: '100%', height: '100%', position: 'absolute', overflow: 'hidden',
});

export const MyFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
}));
