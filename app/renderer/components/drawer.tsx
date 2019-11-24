import React from 'react';
import { observer } from 'mobx-react';
import startCase from 'lodash-es/startCase';
import clsx from 'clsx';
import {
  useTheme,
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import SaveIcon from '@material-ui/icons/Save';
import { PanelSelect } from './inputs/PanelSelect';
import { useStyles } from './style';

export const PersistentDrawerLeft = observer(({ store }) => {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const { selectedShape, polyhedraPyramidGeometries } = store;
  const setSelectedPolyhedron = store.getSetter('selectedShape');
  const polyhedronOptions = Object.keys(polyhedraPyramidGeometries)
    .map((polyKey) => ({ value: polyKey, label: startCase(polyKey) }));

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
          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke('save-string', store.renderPyramidNetToString()) //eslint-disable-line
                .then((result) => {
                  if (result) {
                    console.log('File saved');
                  } else {
                    console.log('File save cancelled');
                  }
                });
            }}
          >
            <SaveIcon />
          </IconButton>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />

        <PanelSelect
          label="Polyhedron"
          value={selectedShape}
          options={polyhedronOptions}
          setter={setSelectedPolyhedron}
        />
      </Drawer>
    </div>
  );
});
