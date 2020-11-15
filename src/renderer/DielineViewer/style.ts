import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const drawerWidth = 500;

export const useStyles = makeStyles((theme: Theme) => createStyles({
  '@global': {
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
  root: {
    display: 'flex',
  },
  menuButton: {
    top: theme.spacing(1),
    left: theme.spacing(1),
    position: 'fixed',
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
  toolbar: {
    padding: `0 ${theme.spacing(1)}px`,
  },
  closeDielineControlsIcon: {
    marginLeft: 'auto',
  },
  dielineToolbarTab: {
    minWidth: 120,
  },
  formControl: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
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
}));
