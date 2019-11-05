import React from 'react';
import clsx from 'clsx';
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';

import startCase from 'lodash-es/startCase';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

// eslint-disable-next-line import/no-cycle
import { NetConfigContext } from '../App';

const drawerWidth = 360;

const useStyles = makeStyles((theme: Theme) => createStyles({
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

export function PersistentDrawerLeft() {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const { selectedPolyhedron, setSelectedPolyhedron, polyhedra } = React.useContext(NetConfigContext);

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Fab
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        className={clsx(classes.menuButton, open && classes.hide)}
      >
        <MenuIcon />
      </Fab>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />

        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Polyhedron</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedPolyhedron}
            onChange={(e) => {
              setSelectedPolyhedron(e.target.value);
            }}
          >
            {Object.keys(polyhedra).map((polyhedraKey, i) => (
              <MenuItem key={i} value={polyhedraKey}>{startCase(polyhedraKey)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Drawer>
    </div>
  );
}
