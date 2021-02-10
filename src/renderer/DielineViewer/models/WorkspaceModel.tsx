import {
  applySnapshot, getType, Instance, onSnapshot, types,
} from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React, { createContext, useContext } from 'react';
import persist from 'mst-persist';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';
import parseFilepath from 'parse-filepath';
import { startCase } from 'lodash';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';

import { SVGWrapper } from '../data/SVGWrapper';
import { PreferencesModel, defaultPreferences } from './PreferencesModel';
import { PyramidNetOptionsInfo } from '../widgets/PyramidNet';
import { CylinderLightboxWidgetOptionsInfo } from '../widgets/CylinderLightbox';
import { WINDOWS } from '../../../main/ipc';
import { CustomBrowserWindowType } from '../../../main';
import { PyramidNetTestTabsOptionsInfo } from '../widgets/PyramidNetTestTabs';

const getPreferencesStore = () => {
  const preferencesStore = PreferencesModel.create(defaultPreferences);
  persist('preferencesStoreLocal', preferencesStore);
  return preferencesStore;
};

export const WorkspaceModel = types.model({
  currentFilePath: types.maybe(types.string),
  widgetOptions: types.frozen({
    'polyhedral-net': PyramidNetOptionsInfo,
    'cylinder-lightbox': CylinderLightboxWidgetOptionsInfo,
    'polyhedral-net-test-tabs': PyramidNetTestTabsOptionsInfo,
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
      return this.selectedWidgetInfo.WidgetModel.create({});
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
    get selectedShapeName() {
      return getType(this.selectedStore.shapeDefinition).name;
    },
    get currentFileName() {
      return self.currentFilePath ? parseFilepath(self.currentFilePath).name : `New ${this.selectedShapeName}`;
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
      reaction(() => [self.titleBarText], () => {
        // TODO: why can't this be coerced
        // @ts-ignore
        const currentWindow = (remote.getCurrentWindow() as CustomBrowserWindowType);
        // TODO: having texture window title bar populated because it imports workspace model is a sloppy abstraction,
        // scope this concern to the store for texture editor and only use this reaction for dieline editor
        const fileTrackingFragment = currentWindow.route === WINDOWS.DIELINE_EDITOR ? `‖  ${
          self.titleBarText}` : '';
        currentWindow
          .setTitle(`${self.selectedShapeName} ‖  ${startCase(currentWindow.route)}  ${fileTrackingFragment}`);
      }, { fireImmediately: true });
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
    setCurrentFilePath(filePath) {
      self.currentFilePath = filePath;
      this.setIsPristine(true);
    },
  }));

export interface IWorkspaceModel extends Instance<typeof WorkspaceModel> {}
// TODO: instantiating this store directly in the module causes unintended side-effects in texture editor:
// reaction for title bar runs there too but workspace model is only the concern of dieline editor
// consider this side-effect has the advantage of displaying model name in texture editor -> it doesn't have
// access to shapeDefinition's model name otherwise
export const workspaceStore = WorkspaceModel.create({});
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
