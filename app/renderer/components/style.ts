import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const drawerWidth = 360;

export const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  menuButton: {
    top: theme.spacing(1),
    left: theme.spacing(1),
    position: 'fixed',
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  drawerPaper: {
    width: drawerWidth,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));
