import ReactDOMServer from 'react-dom/server';
import { SnapshotOutOf } from 'mobx-keystone';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import React from 'react';
import fileDownload from 'js-file-download';
import { DocumentArea, FileMenuItem, SVGWrapper } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { PyramidNetTestTabs } from './PyramidNetTestTabsSvg';
import { PositionableFaceDecorationModel } from '../models/PositionableFaceDecorationModel';

export const renderTestTabsToString = (widgetStore, documentArea: DocumentArea): string => ReactDOMServer
  .renderToString(
    <SVGWrapper documentArea={documentArea}>
      <PyramidNetTestTabs widgetStore={widgetStore} />
    </SVGWrapper>,
  );

export interface TextureArrangementJsonData {
  shapeName: string,
  textureSnapshot: SnapshotOutOf<PositionableFaceDecorationModel>,
}

const DOWNLOAD_TEMPLATE_TXT = 'Download face template SVG (current shape)';
const IMPORT_SVG_DECORATION_TXT = 'Import face cut pattern from SVG';
const DOWNLOAD_TAB_TESTER_TXT = 'Download tab tester SVG';

export const additionalFileMenuItemsFactory = (store: PyramidNetWidgetModel): FileMenuItem[] => [{
  menuText: DOWNLOAD_TEMPLATE_TXT,
  MenuIcon: ChangeHistoryIcon,
  action: async () => {
    fileDownload(store.renderDecorationBoundaryToString(), `${store.pyramid.shapeName.value}__template.svg`);
  },
},
{
  menuText: IMPORT_SVG_DECORATION_TXT,
  MenuIcon: OpenInBrowserIcon,
  action: () => {
    store.activateImportFaceDialog();
  },
},
{
  menuText: DOWNLOAD_TAB_TESTER_TXT,
  MenuIcon: HowToVoteIcon,
  action: async () => {
    // TODO: real bounds
    fileDownload(renderTestTabsToString(store, { width: 100, height: 100 }), `${store.fileBasename}--test-tabs.svg`);
  },
},
];
