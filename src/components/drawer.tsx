import React from 'react';
import clsx from 'clsx';
import {
  useTheme,
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';

import startCase from 'lodash-es/startCase';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

// eslint-disable-next-line import/no-cycle
import { NetConfigContext } from '~App';
import { PanelSelect } from './inputs/PanelSelect';
import { useStyles } from './style';

export function PersistentDrawerLeft() {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const { selectedPolyhedron, setSelectedPolyhedron, polyhedra } = React.useContext(NetConfigContext);
  const polyhedronOptions = Object.keys(polyhedra).map((polyKey) => ({ value: polyKey, label: startCase(polyKey) }));

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
        <PanelSelect
          label="Polyhedron"
          value={selectedPolyhedron}
          options={polyhedronOptions}
          setter={setSelectedPolyhedron}
        />
      </Drawer>
    </div>
  );
}
