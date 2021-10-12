import { styled } from '@mui/styles';
import { Button, FormControl, darkScrollbar } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...darkScrollbar(),
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

export const panelButtonStyles = {
  // additional specificity not needed in dev build but this style not applied in production build
  '&.MuiButtonBase-root': {
    color: 'inherit',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
};
export const PanelButton = styled(Button)(panelButtonStyles);

export const MyFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
}));
