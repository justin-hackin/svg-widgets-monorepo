import {
  applySnapshot, getSnapshot, getType, Instance, types,
} from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React, { createContext, useContext } from 'react';
import persist from 'mst-persist';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';
import parseFilepath from 'parse-filepath';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';

import { SVGWrapper } from '../data/SVGWrapper';
import { PreferencesModel, defaultPreferences } from './PreferencesModel';
import { PyramidNetOptionsInfo } from '../widgets/PyramidNet';
import { CylinderLightboxWidgetOptionsInfo } from '../widgets/CylinderLightbox';
import { PyramidNetTestTabsOptionsInfo } from '../widgets/PyramidNetTestTabs';

const getPreferencesStore = () => {
  const preferencesStore = PreferencesModel.create(defaultPreferences);
  persist('preferencesStoreLocal', preferencesStore);
  return preferencesStore;
};

export const WorkspaceModel = types.model('Workspace', {
  widgetOptions: types.frozen({
    'polyhedral-net': PyramidNetOptionsInfo,
    'cylinder-lightbox': CylinderLightboxWidgetOptionsInfo,
    'polyhedral-net-test-tabs': PyramidNetTestTabsOptionsInfo,
  }),
  selectedWidgetName: 'polyhedral-net',
})
  .volatile(() => ({
    preferences: getPreferencesStore(),
    savedSnapshot: undefined,
    currentFilePath: undefined,
    disposers: [],
  }))
  .views((self) => ({
    get selectedWidgetInfo() {
      return self.widgetOptions[self.selectedWidgetName];
    },
    get SelectedRawSvgComponent() {
      return this.selectedWidgetInfo.RawSvgComponent;
    },
    get selectedStore() {
      return this.selectedWidgetInfo.WidgetModel.create({});
    },
    get selectedControlPanelProps() {
      return this.selectedWidgetInfo.controlPanelProps;
    },
    get selectedAdditionalMainContent() {
      return this.selectedWidgetInfo.additionalMainContent;
    },
    get selectedStoreIsSaved() {
      // TODO: consider custom middleware that would obviate the need to compare snapshots on every change,
      // instead flagging history records with the associated file name upon save
      // + creating a middleware variable currentSnapshotIsSaved
      // this will also allow history to become preserved across files with titlebar accuracy
      const currentSnapshot = getSnapshot(this.selectedStore.shapeDefinition);
      // TODO: why does lodash isEqual fail to accurately compare these and why no comparator with mst?
      return JSON.stringify(self.savedSnapshot) === JSON.stringify(currentSnapshot);
    },
    get SelectedControlPanelComponent() {
      return this.selectedWidgetInfo.ControlPanelComponent;
    },
    get SelectedControlledSvgComponent() {
      const ObservedSvgComponent = observer(this.SelectedRawSvgComponent);

      return observer(() => (
        <ObservedSvgComponent widgetStore={this.selectedStore} preferencesStore={self.preferences} />));
    },
    get selectedShapeName() {
      return getType(this.selectedStore.shapeDefinition).name;
    },
    get currentFileName() {
      return self.currentFilePath ? parseFilepath(self.currentFilePath).name : `New ${this.selectedShapeName}`;
    },
    get fileTitleFragment() {
      return `${this.selectedStoreIsSaved ? '' : '*'}${this.currentFileName}`;
    },
    get titleBarText() {
      return `${this.selectedShapeName} ‖ ${this.fileTitleFragment}`;
    },
  }))
  .actions((self) => ({
    afterCreate() {
      // title bar changes for file status indication
      self.disposers.push(reaction(() => [self.titleBarText], () => {
        document.title = self.titleBarText;
      }, { fireImmediately: true }));
    },
    beforeDestroy() {
      for (const disposer of self.disposers) {
        disposer();
      }
    },
    setSelectedWidgetName(name) {
      self.selectedWidgetName = name;
      this.clearCurrentFileData();
    },
    renderWidgetToString() {
      const { SelectedRawSvgComponent } = self;
      return ReactDOMServer.renderToString(
        <SVGWrapper {...self.preferences.dielineDocumentDimensions}>
          <SelectedRawSvgComponent
            preferencesStore={self.preferences}
            widgetStore={self.selectedStore}
          />
        </SVGWrapper>,
      );
    },
    resetPreferences() {
      self.preferences.reset();
    },
    resetModelToDefault() {
      applySnapshot(self.selectedStore, {});
    },
    setCurrentFileData(filePath, snapshot) {
      self.currentFilePath = filePath;
      self.savedSnapshot = snapshot;
    },
    clearCurrentFileData() {
      self.currentFilePath = undefined;
      self.savedSnapshot = undefined;
    },
  }));

export interface IWorkspaceModel extends Instance<typeof WorkspaceModel> {}
// TODO: instantiating this store directly in the module causes unintended side-effects in texture editor:
// reaction for title bar runs there too but workspace model is only the concern of dieline editor
// consider this side-effect has the advantage of displaying model name in texture editor -> it doesn't have
// access to shapeDefinition's model name otherwise
export const workspaceStore = WorkspaceModel.create({});
// @ts-ignore
window.workpsaceStore = workspaceStore;
const WorkspaceStoreContext = createContext<IWorkspaceModel>(workspaceStore);

export const { Provider: WorkspaceProvider } = WorkspaceStoreContext;

export const WorkspaceStoreProvider = ({ children }) => (
  <WorkspaceProvider value={workspaceStore}>{children}</WorkspaceProvider>
);

export function useWorkspaceMst() {
  return useContext(WorkspaceStoreContext);
}

if (process.env.NODE_ENV !== 'production') {
  connectReduxDevtools(remotedev, workspaceStore);
  makeInspectable(workspaceStore);
}
