import { createStyles, makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { darkThemeOptions } from '../../renderer/DielineViewer/data/material-ui-themes';

const drawerWidth = 500;
export const useStyles = makeStyles((theme: Theme) => createStyles({
  '@global': {
    body: {
      margin: 0,
      padding: 0,
      'font-family': 'sans-serif',
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
    // borrowed from https://github.com/mui-org/material-ui/issues/22594#issue-701034896
    scrollbarColor: `${theme.palette.grey['700']}  ${theme.palette.grey.A400}`,
    '*::-webkit-scrollbar': {
      backgroundColor: theme.palette.grey.A400,
    },
    '*::-webkit-scrollbar-thumb': {
      borderRadius: 8,
      backgroundColor: theme.palette.grey['700'],
      minHeight: 24,
      border: `2px solid ${theme.palette.grey.A400}`,
    },
    '*::-webkit-scrollbar-thumb:focus': {
      backgroundColor: theme.palette.grey['500'],
    },
    '*::-webkit-scrollbar-thumb:active': {
      backgroundColor: theme.palette.grey['500'],
    },
    '*::-webkit-scrollbar-corner': {
      backgroundColor: theme.palette.grey.A400,
    },
  },
  fullPage: {
    width: '100%', height: '100%', position: 'absolute', overflow: 'hidden',
  },
  dielineEditorRoot: {
    display: 'flex',
  },
  simpleDialog: {
    maxHeight: '90%',
  },
  simpleDialogContent: {
    overflow: 'auto',
    padding: theme.spacing(1),
  },
  dielinePanelFab: {
    top: theme.spacing(1),
    right: theme.spacing(1),
    position: 'absolute',
  },
  dielinePanelButton: {
    color: 'inherit',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
  },
  closeDialogButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  sliderTextInputContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  sliderTextInput: {
    flex: '1 0 0',
    paddingRight: theme.spacing(1),
  },
  sliderTextInputToggle: {
    flex: '0 0 0',
  },
  widgetFab: {
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    position: 'absolute',
  },
  widgetAvatar: {
    width: 160,
    height: 'auto',
  },
  widgetName: {
    marginLeft: theme.spacing(3),
    fontSize: '2em',
  },
  shapeAvatar: {
    // why does Electron build not need this extra specificity but web build does require
    '&.MuiAvatar-root': {
      width: 100,
      height: 'auto',
    },
  },
  shapeName: {
    marginLeft: theme.spacing(2),
    fontSize: '1.5em',
  },
  openTextureButton: {
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    position: 'fixed',
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    overflowY: 'unset',
    position: 'absolute',
  },
  tabContent: {
    display: 'flex',
    padding: theme.spacing(1),
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  shapeSection: {
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
  },
  shapeSelect: {
    marginTop: theme.spacing(1),
  },
  compactShapeSelect: {},
  shapeSelectDisplay: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '&$compactShapeSelect': {
      '& $shapeName': {
        display: 'none',
      },
      '& $shapeAvatar': {
        width: '50px',
      },
    },
  },
  toolbar: {
    padding: `0 ${theme.spacing(1)}px`,
  },
  closeDielineControlsIcon: {
    marginLeft: 'auto',
  },
  formControl: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    '&$shapeSelect': {
      '&$compactShapeSelect': {
        width: '75px',
      },
    },
  },
  shapeHeightFormControl: {
    marginTop: theme.spacing(3),
  },
  panelChromePicker: {
    alignSelf: 'flex-end',
    // yes its dirty but component uses style attributes, forcing the dreaded!
    background: `${theme.palette.grey['800']} !important`,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  controlPaper: {
    display: 'grid',
  },
  zoomPanToolbar: {
    backgroundColor: theme.palette.grey.A700,
    display: 'flex',
    flexDirection: 'row',
    padding: '2px 1px',
  },
  // ======================== TEXTURE EDITOR ========================
  shapePreviewContainer: {
    background: 'url(../../static/images/space.jpg) no-repeat center center fixed',
    '-webkit-background-size': 'cover',
    '-moz-background-size': 'cover',
    '-o-background-size': 'cover',
    'background-size': 'cover',
  },
  textureEditorRoot: {
    backgroundColor: theme.palette.grey.A400,
    height: '100%',
    color: theme.palette.grey['300'],
  },
  textureEditorPaper: {
    width: '100%',
    overflowY: 'unset',
    position: 'absolute',
  },
  textureEditorMainArea: {
    flex: '1 1 auto',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    gridTemplateRows: '100%',
    height: '100%',
    width: '100%',
  },
  select: {
    display: 'flex', position: 'absolute', top: 0, right: 0,
  },
  rotationInput: {
    width: '6.5em',
  },
  rotateButton: {
    transform: 'rotate(90deg)',
  },
  loadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    zIndex: 100,
  },
  textureNodeHighlight: {
    fill: 'rgba(255, 0, 255, 0.00001)',
    '&:hover': {
      fill: 'rgba(255, 0, 255, 0.3)',
    },
    '&.selected': {
      fill: 'none',
    },
  },
  textureNode: {
    fill: '#00A9F4',
    '&.selected': {
      fill: '#ff00ff',
    },
  },
  nodeScaleMuxSlider: {
    width: theme.spacing(10),
  },
  textureToolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    position: 'initial',
  },
  textureToolbarWithTexture: {
    [theme.breakpoints.down('md')]: {
      justifyContent: 'space-around',
    },
  },
  textureEditorNodeInputs: {
    display: 'inline-flex',
  },
}));

export const theme = createMuiTheme(darkThemeOptions);
