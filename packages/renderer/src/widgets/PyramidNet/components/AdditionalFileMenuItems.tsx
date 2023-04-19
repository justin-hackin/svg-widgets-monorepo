import React from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { startCase } from 'lodash';

import { fromSnapshot, SnapshotOutOf } from 'mobx-keystone';
import ReactDOMServer from 'react-dom/server';
import { styled } from '@mui/styles';
import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import { IS_ELECTRON_BUILD } from '../../../../../common/constants';
import { PositionableFaceDecorationModel } from '../models/PositionableFaceDecorationModel';
import { RawFaceDecorationModel } from '../models/RawFaceDecorationModel';
import { electronApi } from '../../../../../common/electron';
import { SVGWrapper } from '../../../WidgetWorkspace/components/SVGWrapper';
import { PyramidNetTestTabs } from './PyramidNetTestTabsSvg';

export const renderTestTabsToString = (widgetStore): string => ReactDOMServer.renderToString(
  <SVGWrapper>
    <PyramidNetTestTabs widgetStore={widgetStore} />
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

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),
}));

export const AdditionalFileMenuItems = ({ resetFileMenuRef }) => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetWidgetModel;

  return (
    <>
      {/* NEW */}
      <MenuItem onClick={async () => {
        if (IS_ELECTRON_BUILD) {
          await electronApi.saveSvgWithDialog(
            store.renderDecorationBoundaryToString(),
            DOWNLOAD_TEMPLATE_TXT,
            `${store.savedModel.pyramid.shapeName}__template.svg`,
          );
        }
        resetFileMenuRef();
      }}
      >
        <ListItemIconStyled>
          <ChangeHistoryIcon fontSize="small" />
        </ListItemIconStyled>
        <ListItemText primary={DOWNLOAD_TEMPLATE_TXT} />
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
        <ListItemIconStyled>
          <OpenInBrowserIcon fontSize="small" />
        </ListItemIconStyled>
        <ListItemText primary={IMPORT_SVG_DECORATION_TXT} />
      </MenuItem>

      {/* LOAD TEXTURE JSON */}
      <MenuItem onClick={async () => {
        const res = await electronApi.getJsonFromDialog(IMPORT_TEXTURE_TXT);
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
        <ListItemIconStyled>
          <BlurOnIcon fontSize="small" />
        </ListItemIconStyled>
        <ListItemText primary={IMPORT_TEXTURE_TXT} />
      </MenuItem>

      {/* DOWNLOAD TAB TEST */}
      <MenuItem onClick={async () => {
        await electronApi.saveSvgWithDialog(
          renderTestTabsToString(store),
          DOWNLOAD_TAB_TESTER_TXT,
          `${store.fileBasename}--test-tabs.svg`,
        );
        resetFileMenuRef();
      }}
      >
        <ListItemIconStyled>
          <HowToVoteIcon fontSize="small" />
        </ListItemIconStyled>
        <ListItemText primary={DOWNLOAD_TAB_TESTER_TXT} />
      </MenuItem>
    </>
  );
};
