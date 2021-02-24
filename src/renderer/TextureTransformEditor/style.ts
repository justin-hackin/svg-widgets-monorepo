import { makeStyles, createStyles, Theme } from '@material-ui/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    backgroundColor:
        '#333',
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    color: '#fff',
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
  checkboxControlLabel: {
    color: '#fff',
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
}));
