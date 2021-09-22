import React from 'react';
import { ListItemIcon, MenuItem, Typography } from '@material-ui/core';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { startCase } from 'lodash';

import { fromSnapshot, SnapshotOutOf } from 'mobx-keystone';
import ReactDOMServer from 'react-dom/server';
import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { PyramidNetWidgetModel } from '../models/PyramidNetMakerStore';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import { useStyles } from '../../../common/style/style';
import { IS_ELECTRON_BUILD } from '../../../../../common/constants';
import { PositionableFaceDecorationModel } from '../models/PositionableFaceDecorationModel';
import { RawFaceDecorationModel } from '../models/RawFaceDecorationModel';
import { electronApi } from '../../../../../common/electron';
import { SVGWrapper } from '../../../WidgetWorkspace/components/SVGWrapper';
import { PyramidNetTestTabs } from '../../PyramidNetTestTabs/PyramidNetTestTabsSvg';

export const renderTestTabsToString = (widgetStore, preferencesStore): string => ReactDOMServer.renderToString(
  <SVGWrapper>
    <PyramidNetTestTabs preferencesStore={preferencesStore} widgetStore={widgetStore} />
  </SVGWrapper>,
);

export interface TextureArrangementJsonData {
  shapeName: string,
  textureSnapshot: SnapshotOutOf<PositionableFaceDecorationModel>,
}

const DOWNLOAD_TEMPLATE_TXT = 'Download face template SVG (current shape)';
const IMPORT_SVG_DECORATION_TXT = 'Import face cut pattern from SVG';
const IMPORT_TEXTURE_TXT = 'Import texture from texture editor export';
const DOWNLOAD_TAB_TESTER_TXT = 'Download tab tester SVG';

export const AdditionalFileMenuItems = ({ resetFileMenuRef }) => {
  const workspaceStore = useWorkspaceMst();
  const preferencesStore = workspaceStore.preferences;
  const classes = useStyles();
  const store = workspaceStore.selectedStore as PyramidNetWidgetModel;

  return (
    <>
      {/* NEW */}
      <MenuItem onClick={async () => {
        if (IS_ELECTRON_BUILD) {
          await electronApi.saveSvgFromDialog(
            store.renderDecorationBoundaryToString(),
            DOWNLOAD_TEMPLATE_TXT,
            `${store.savedModel.pyramid.shapeName}__template.svg`,
          );
        }
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
        if (IS_ELECTRON_BUILD) {
          const res = await electronApi.openSvgWithDialog(IMPORT_SVG_DECORATION_TXT);
          if (res !== undefined) {
            const { fileString, filePath } = res;
            const dValue = extractCutHolesFromSvgString(fileString);
            // This file should have a .svg extension, without an extension this will be ''
            const baseFileName = filePath.split('.').slice(0, -1).join('.');
            store.savedModel
              .setFaceDecoration(new RawFaceDecorationModel({ dValue, sourceFileName: baseFileName }));
          }
        }
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
        const res = await electronApi.getJsonFromDialog(IMPORT_TEXTURE_TXT, 'pnst', 'Pyramid Net Spec Texture');
        const currentShapeName = store.savedModel.pyramid.shapeName.value;
        resetFileMenuRef();
        if (res === undefined) {
          return;
        }
        const fileData = res.fileData as TextureArrangementJsonData;
        if (fileData.shapeName !== currentShapeName) {
          // eslint-disable-next-line no-restricted-globals, no-alert
          const doIt = confirm(`The current shape is ${startCase(currentShapeName)
          } but the chosen texture was for ${startCase(fileData.shapeName)
          } shape. Do you want to change the Polyhedron and load its default settings?`);
          if (doIt) {
            store.savedModel.pyramid.shapeName.setValue(fileData.shapeName);
          } else {
            return;
          }
        }
        store.savedModel.setFaceDecoration(fromSnapshot<PositionableFaceDecorationModel>(fileData.textureSnapshot));
      }}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <BlurOnIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">{IMPORT_TEXTURE_TXT}</Typography>
      </MenuItem>

      {/* DOWNLOAD TAB TEST */}
      <MenuItem onClick={async () => {
        await electronApi.saveSvgFromDialog(
          renderTestTabsToString(store, preferencesStore),
          DOWNLOAD_TAB_TESTER_TXT,
          `${store.getFileBasename()}--test-tabs.svg`,
        );
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
