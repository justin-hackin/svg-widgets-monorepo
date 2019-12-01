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
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import PublishIcon from '@material-ui/icons/Publish';
import { PanelSelect } from './inputs/PanelSelect';
import { PanelSlider } from './inputs/PanelSlider';
import { useStyles } from './style';

export const ControlPanel = observer(({ store }) => {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const { selectedShape, polyhedraPyramidGeometries } = store;
  const setSelectedPolyhedron = store.getSetter('selectedShape');
  const setStrokeWidth = store.getSetter('styleSpec.dieLineProps.strokeWidth');
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
              ipcRenderer.invoke('save-svg', store.renderPyramidNetToString(), 'Save pyramid net dielines');
            }}
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke('save-svg', store.renderFaceBoundaryToString(), 'Save face template');
            }}
          >
            <SaveAltIcon />
          </IconButton>
          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke('open-svg', 'Upload face cut pattern').then((svgString) => {
                store.applyFaceHolePattern(svgString);
              });
            }}
          >
            <PublishIcon />
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
          setter={(val) => {
            setSelectedPolyhedron(val);
            store.clearFaceHolePattern();
          }}
        />

        <PanelSlider
          label="Dieline Stroke"
          min={0}
          max={3}
          step={0.01}
          value={store.styleSpec.dieLineProps.strokeWidth}
          setter={setStrokeWidth}
        />
      </Drawer>
    </div>
  );
});
