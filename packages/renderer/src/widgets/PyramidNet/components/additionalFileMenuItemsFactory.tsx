import ReactDOMServer from 'react-dom/server';
import { fromSnapshot, SnapshotOutOf } from 'mobx-keystone';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import React from 'react';
import { startCase } from 'lodash';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { SVGWrapper } from '../../../WidgetWorkspace/components/SVGWrapper';
import { PyramidNetTestTabs } from './PyramidNetTestTabsSvg';
import { PositionableFaceDecorationModel } from '../models/PositionableFaceDecorationModel';
import { IS_ELECTRON_BUILD } from '../../../../../common/constants';
import { electronApi } from '../../../../../common/electron';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import { RawFaceDecorationModel } from '../models/RawFaceDecorationModel';
import { FileMenuItem } from '../../../WidgetWorkspace/widget-types/BaseWidgetClass';

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

export const additionalFileMenuItemsFactory = (store: PyramidNetWidgetModel): FileMenuItem[] => [{
  menuText: DOWNLOAD_TEMPLATE_TXT,
  MenuIcon: ChangeHistoryIcon,
  action: async () => {
    if (IS_ELECTRON_BUILD) {
      await electronApi.saveSvgWithDialog(
        store.renderDecorationBoundaryToString(),
        DOWNLOAD_TEMPLATE_TXT,
        `${store.pyramid.shapeName}__template.svg`,
      );
    }
  },
},
{
  menuText: IMPORT_SVG_DECORATION_TXT,
  MenuIcon: OpenInBrowserIcon,
  action: async () => {
    if (IS_ELECTRON_BUILD) {
      const res = await electronApi.openSvgWithDialog(IMPORT_SVG_DECORATION_TXT);
      if (res !== undefined) {
        const { fileString, filePath } = res;
        const dValue = extractCutHolesFromSvgString(fileString);
        // This file should have a .svg extension, without an extension this will be ''
        const baseFileName = filePath.split('.').slice(0, -1).join('.');
        store.setFaceDecoration(new RawFaceDecorationModel({ dValue, sourceFileName: baseFileName }));
      }
    }
  },
}, {
  menuText: IMPORT_TEXTURE_TXT,
  MenuIcon: BlurOnIcon,
  action: async () => {
    const res = await electronApi.getJsonFromDialog(IMPORT_TEXTURE_TXT);
    const currentShapeName = store.pyramid.shapeName.value;
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
        store.pyramid.shapeName.setValue(fileData.shapeName);
      } else {
        return;
      }
    }
    store.setFaceDecoration(fromSnapshot<PositionableFaceDecorationModel>(fileData.textureSnapshot));
  },
},
{
  menuText: DOWNLOAD_TAB_TESTER_TXT,
  MenuIcon: HowToVoteIcon,
  action: async () => {
    await electronApi.saveSvgWithDialog(
      renderTestTabsToString(store),
      DOWNLOAD_TAB_TESTER_TXT,
      `${store.fileBasename}--test-tabs.svg`,
    );
  },
},
];
