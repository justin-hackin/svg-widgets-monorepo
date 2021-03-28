import React from 'react';
import { ListItemIcon, MenuItem, Typography } from '@material-ui/core';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { startCase } from 'lodash';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../models/PyramidNetMakerStore';
import { extractCutHolesFromSvgString } from '../../../../../common/util/svg';
import { useStyles } from '../../../../../common/style/style';
import { EVENTS } from '../../../../../common/constants';

const DOWNLOAD_TEMPLATE_TXT = 'Download face template SVG (current shape)';
const IMPORT_SVG_DECORATION_TXT = 'Import face cut pattern from SVG';
const IMPORT_TEXTURE_TXT = 'Import texture from texture editor export';
const DOWNLOAD_TAB_TESTER_TXT = 'Download tab tester SVG';

export const AdditionalFileMenuItems = ({ resetFileMenuRef }) => {
  const workspaceStore = useWorkspaceMst();
  const { selectedWidgetOptions: { specFileExtension, specFileExtensionName = undefined } } = workspaceStore;
  const preferencesStore = workspaceStore.preferences;
  const classes = useStyles();
  const store = workspaceStore.selectedStore as IPyramidNetPluginModel;

  return (
    <>
      {/* NEW */}
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_SAVE_SVG, store.renderDecorationBoundaryToString(), {
          message: DOWNLOAD_TEMPLATE_TXT,
          defaultPath: `${store.pyramidNetSpec.pyramid.shapeName}__template.svg`,
        });
        resetFileMenuRef();
      }}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <ChangeHistoryIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{DOWNLOAD_TEMPLATE_TXT}</Typography>
      </MenuItem>

      {/* OPEN RAW SVG FACE DECORATION */}
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_OPEN_SVG, IMPORT_SVG_DECORATION_TXT)
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
        <Typography variant="inherit">{IMPORT_SVG_DECORATION_TXT}</Typography>
      </MenuItem>

      {/* LOAD TEXTURE JSON */}
      <MenuItem onClick={async () => {
        const res = await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_OPEN_JSON, {
          message: IMPORT_TEXTURE_TXT,
        }, specFileExtension, specFileExtensionName);
        const currentShapeName = store.pyramidNetSpec.pyramid.shapeName;
        resetFileMenuRef();
        if (!res) {
          return;
        }
        const { fileData } = res;
        if (fileData.shapeName !== currentShapeName) {
          // eslint-disable-next-line no-restricted-globals, no-alert
          const doIt = confirm(`The current shape is ${startCase(currentShapeName)
          } but the chosen texture was for ${startCase(fileData.shapeName)
          } shape. Do you want to change the Polyhedron and load its default settings?`);
          if (doIt) {
            store.pyramidNetSpec.setPyramidShapeName(fileData.shapeName);
          } else {
            return;
          }
        }
        store.pyramidNetSpec.setTextureFaceDecoration(fileData.textureSnapshot);
      }}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <BlurOnIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{IMPORT_TEXTURE_TXT}</Typography>
      </MenuItem>

      {/* DOWNLOAD TAB TEST */}
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_SAVE_SVG, store.renderTestTabsToString(store, preferencesStore), {
          message: DOWNLOAD_TAB_TESTER_TXT,
          defaultPath: `${store.getFileBasename()}--test-tabs.svg`,
        });
        resetFileMenuRef();
      }}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <HowToVoteIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{DOWNLOAD_TAB_TESTER_TXT}</Typography>
      </MenuItem>
    </>
  );
};
