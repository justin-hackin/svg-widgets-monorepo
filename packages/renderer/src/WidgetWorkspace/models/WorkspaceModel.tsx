import React, { createContext, useContext } from 'react';
import { computed, observable, reaction } from 'mobx';
import {
  connectReduxDevTools,
  detach,
  getSnapshot,
  model,
  Model,
  modelAction,
  prop,
  registerRootStore,
} from 'mobx-keystone';
import { persist } from 'mobx-keystone-persist';
import { startCase } from 'lodash';
import {
  fitToViewer, // @ts-ignore
  INITIAL_VALUE, Tool, TOOL_PAN, Value,
} from 'react-svg-pan-zoom';
import { IS_DEVELOPMENT_BUILD, IS_ELECTRON_BUILD } from '../../../../common/constants';
import { PyramidNetWidgetModel } from '../../widgets/PyramidNet/models/PyramidNetWidgetStore';
import { radioProp } from '../../common/keystone-tweakables/props';
import { UNITS } from '../../common/util/units';
import { CylinderLightboxWidgetModel } from '../../widgets/CylinderLightbox/models';
import { SquareGridDividerWidgetModel } from '../../widgets/CrosshatchShelves/SquareGridDividerWidgetModel';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';
import { DiamondGridDividerWidgetModel } from
  '../../widgets/CrosshatchShelves/DiamondGridDividerWidgetModel';
import { TriangularGridWidgetModel }
  from '../../widgets/CrosshatchShelves/TriangularGrid';

// this assumes a file extension exists
const baseFileName = (fileName) => fileName.split('.').slice(0, -1).join('.');

@model('WorkspacePreferencesModel')
class WorkspacePreferencesModel extends Model({
    displayUnit: radioProp(UNITS.cm, {
      options: Object.values(UNITS).map((unit) => ({ value: unit, label: unit })),
      isRow: true,
    }),
  }) {}

const PREFERENCES_LOCALSTORE_NAME = 'WorkspacePreferencesModel';
const widgetOptions = {
  'polyhedral-net': PyramidNetWidgetModel,
  'cylinder-lightbox': CylinderLightboxWidgetModel,
  'square-grid-divider': SquareGridDividerWidgetModel,
  'diamond-grid-divider': DiamondGridDividerWidgetModel,
  'triangle-grid-divider': TriangularGridWidgetModel,
};

const defaultWidgetName = 'triangle-grid-divider';

@model('WorkspaceModel')
export class WorkspaceModel extends Model({
  selectedWidgetName: prop<string>().withSetter(),
  selectedStore: prop<BaseWidgetClass>().withSetter(),
  preferences: prop(() => (new WorkspacePreferencesModel({}))),
}) {
  widgetOptions = widgetOptions;

  @observable
  savedSnapshot = undefined;

  @observable
  currentFilePath = undefined;

  @observable
  zoomPanValue: Value = INITIAL_VALUE;

  @observable
  zoomPanTool: Tool = TOOL_PAN;

  onAttachedToRootStore() {
    const disposers = [
      // title bar changes for file status indication
      reaction(() => [this.titleBarText], () => {
        // @ts-ignore
        document.title = this.titleBarText;
      }, { fireImmediately: true }),
      reaction(() => [this.selectedWidgetName], () => {
        this.clearCurrentFileData();
        this.resetModelToDefault();
      }),
    ];

    this.persistPreferences()
      .then(() => {
        this.setSelectedWidgetName(defaultWidgetName);
        // TODO: get rid of this
        //  why doesn't useLayoutEffect in workspace view cover first render case?
        setTimeout(() => {
          this.fitToDocument();
        }, 300);
      });

    return () => {
      for (const disposer of disposers) {
        disposer();
      }
    };
  }

  @computed
  get selectedWidgetNameReadable() {
    return startCase(this.selectedWidgetName);
  }

  @computed
  get selectedStoreIsSaved() {
    if (!this.selectedStore) { return false; }
    // TODO: consider custom middleware that would obviate the need to compare snapshots on every change,
    // instead flagging history records with the associated file name upon save
    // + creating a middleware variable currentSnapshotIsSaved
    // this will also allow history to become preserved across files with titlebar accuracy
    const currentSnapshot = getSnapshot(this.selectedStore.savedModel);
    // TODO: why does lodash isEqual fail to accurately compare these and why no comparator with mst?
    return JSON.stringify(this.savedSnapshot) === JSON.stringify(currentSnapshot);
  }

  @computed
  get currentFileName() {
    return this.currentFilePath ? baseFileName(this.currentFilePath).name : `New ${this.selectedWidgetNameReadable}`;
  }

  @computed
  get fileTitleFragment() {
    return `${this.selectedStoreIsSaved ? '' : '*'}${this.currentFileName}`;
  }

  @computed
  get titleBarText() {
    return IS_ELECTRON_BUILD
      ? `${this.selectedWidgetNameReadable} ‖ ${this.fileTitleFragment}` : 'Polyhedral Decoration Studio';
  }

  @computed
  get SelectedModel() {
    return this.widgetOptions[this.selectedWidgetName];
  }

  getSelectedModelAssetsFileData() {
    return this.selectedStore.assetDefinition.getAssetsFileData(
      this.selectedStore.getFileBasename(),
    );
  }

  @modelAction
  fitToDocument() {
    this.setZoomPanValue(fitToViewer(this.zoomPanValue));
  }

  @modelAction
  setZoomPanTool(tool: Tool) {
    this.zoomPanTool = tool;
  }

  @modelAction
  setZoomPanValue(value: Value) {
    this.zoomPanValue = value;
  }

  @modelAction
  persistPreferences() {
    return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences)
      .catch(async (e) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to persist preferences, likely due to data schema changes, '
          + 'resetting preferences to defaults: ', e.message);
        await this.resetPreferences();
        return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences);
      });
  }

  @modelAction
  resetPreferences() {
    localStorage.removeItem(PREFERENCES_LOCALSTORE_NAME);
    this.preferences = new WorkspacePreferencesModel({});
    return this.persistPreferences();
  }

  @modelAction
  resetModelToDefault() {
    if (this.selectedStore) {
      detach(this.selectedStore);
    }
    this.setSelectedStore(new this.SelectedModel({}));
  }

  @modelAction
  setCurrentFileData(filePath: string, snapshot: object) {
    this.currentFilePath = filePath;
    this.savedSnapshot = snapshot;
  }

  @modelAction
  clearCurrentFileData() {
    this.currentFilePath = undefined;
    this.savedSnapshot = undefined;
  }
}

export const workspaceStore = new WorkspaceModel({});
registerRootStore(workspaceStore);
const WorkspaceStoreContext = createContext<WorkspaceModel>(workspaceStore);

export const { Provider: WorkspaceProvider } = WorkspaceStoreContext;

export const WorkspaceStoreProvider = ({ children }) => (
  <WorkspaceProvider value={workspaceStore}>{children}</WorkspaceProvider>
);

export function useWorkspaceMst() {
  return useContext(WorkspaceStoreContext);
}

if (IS_DEVELOPMENT_BUILD) {
  // @ts-ignore
  window.workpsaceStore = workspaceStore;
  if (IS_ELECTRON_BUILD) {
    // if this module is imported in web build,
    // `import "querystring"` appears in index bundle, breaks app
    // eslint-disable-next-line import/no-extraneous-dependencies
    import('remotedev').then(({ default: remotedev }) => {
      // create a connection to the monitor (for example with connectViaExtension)
      const connection = remotedev.connectViaExtension({
        name: 'Polyhedral Net Studio',
      });

      connectReduxDevTools(remotedev, connection, workspaceStore);
    });
  }
}
