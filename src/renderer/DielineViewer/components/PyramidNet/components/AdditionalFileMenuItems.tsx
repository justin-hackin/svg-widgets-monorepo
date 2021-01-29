import React from 'react';
import { ListItemIcon, MenuItem, Typography } from '@material-ui/core';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';
import { EVENTS } from '../../../../../main/ipc';
import { extractCutHolesFromSvgString } from '../../../../../common/util/svg';
import { useStyles } from '../../../style';

export const AdditionalFileMenuItems = ({ resetFileMenuRef }) => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  return (
    <>
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.SAVE_SVG, store.renderDecorationBoundaryToString(), {
          message: 'Save face template',
          defaultPath: `${store.pyramidNetSpec.pyramid.shapeName}__template.svg`,
        });
        resetFileMenuRef();
      }}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <ChangeHistoryIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">Download face template SVG (current shape)</Typography>
      </MenuItem>
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.OPEN_SVG, 'Upload face cut pattern')
          .then((svgString) => {
            const d = extractCutHolesFromSvgString(svgString);
            store.pyramidNetSpec.setRawFaceDecoration(d);
          });
        resetFileMenuRef();
      }}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <OpenInBrowserIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">Import face cut path from template</Typography>
      </MenuItem>
    </>
  );
};
