import {
  applySnapshot, Instance, onSnapshot, types,
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
import { CM_TO_PIXELS_RATIO } from '../../common/util/geom';
import { SVGWrapper } from '../data/SVGWrapper';
import { PreferencesModel, defaultPreferences } from './PreferencesModel';
import { PyramidNetOptionsInfo } from '../components/PyramidNet';
import { CylinderLightboxWidgetOptionsInfo } from '../CylinderLightbox';
import { customTitlebar } from '../../index';

const getPreferencesStore = () => {
  const preferencesStore = PreferencesModel.create(defaultPreferences);
  persist('preferencesStoreLocal', preferencesStore);
  return preferencesStore;
};

export const WorkspaceModel = types.model({
  svgDimensions: types.frozen({ width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 }),
  currentFilePath: types.maybe(types.string),
  widgetOptions: types.frozen({
    'polyhedral-net': PyramidNetOptionsInfo,
    'cylinder-lightbox': CylinderLightboxWidgetOptionsInfo,
  }),
  selectedWidgetName: 'polyhedral-net',
})
  .volatile(() => ({
    preferences: getPreferencesStore(),
    isPristine: true,
    isPristineSnapshotDisposer: undefined,
  }))
  .views((self) => ({
    get selectedWidgetInfo() {
      return self.widgetOptions[self.selectedWidgetName];
    },
    get SelectedRawSvgComponent() {
      return this.selectedWidgetInfo.RawSvgComponent;
    },
    get selectedStore() {
      return this.selectedWidgetInfo.WidgetModel.create(this.selectedWidgetInfo.defaultSnapshot);
    },
    get selectedControlPanelProps() {
      return this.selectedWidgetInfo.controlPanelProps;
    },
    get SelectedControlPanelComponent() {
      return this.selectedWidgetInfo.ControlPanelComponent;
    },
    get SelectedControlledSvgComponent() {
      const ObservedSvgComponent = observer(this.SelectedRawSvgComponent);

      return observer(() => (
        <ObservedSvgComponent widgetStore={this.selectedStore} preferencesStore={self.preferences} />));
    },
    get currentFileName() {
      return self.currentFilePath ? parseFilepath(self.currentFilePath).base : 'New Polyhedral Net';
    },
    get titleBarText() {
      return `${self.isPristine ? '' : '*'}${this.currentFileName}`;
    },
  }))
  .actions((self) => ({
    afterCreate() {
      // reset pristine state and tracker on change of selectedStore
      reaction(() => self.selectedStore, () => {
        this.setPristineDisposer(onSnapshot(self.selectedStore, () => {
          this.setIsPristine(false);
        }));
      }, { fireImmediately: true });

      // title bar changes for file status indication
      reaction(() => [self.titleBarText, customTitlebar], () => {
        customTitlebar.updateTitle(self.titleBarText);
      });
    },
    setPristineDisposer(disposer) {
      if (self.isPristineSnapshotDisposer) {
        self.isPristineSnapshotDisposer();
      }
      this.setIsPristine(true);
      self.isPristineSnapshotDisposer = disposer;
    },
    setIsPristine(isPristine) {
      self.isPristine = isPristine;
    },
    setSelectedWidgetName(name) {
      self.selectedWidgetName = name;
      this.setIsPristine(true);
      self.currentFilePath = undefined;
    },
    renderWidgetToString() {
      const { SelectedRawSvgComponent } = self;
      return ReactDOMServer.renderToString(
        <SVGWrapper {...self.svgDimensions}>
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
      applySnapshot(self.selectedStore, self.selectedWidgetInfo.defaultSnapshot);
    },
    setCurrentFilePath(filePath) {
      self.currentFilePath = filePath;
      this.setIsPristine(true);
    },
  }));

export interface IWorkspaceModel extends Instance<typeof WorkspaceModel> {}

export const workspaceStore = WorkspaceModel.create({});
// @ts-ignore
window.workspaceStore = workspaceStore;
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
