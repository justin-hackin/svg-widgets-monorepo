import ReactDOMServer from 'react-dom/server';
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
import { SVGWrapper } from '../components/SVGWrapper';
import { IS_DEVELOPMENT_BUILD, IS_ELECTRON_BUILD } from '../../../../common/constants';
import { PyramidNetWidgetModel } from '../../widgets/PyramidNet/models/PyramidNetWidgetStore';
import { radioProp } from '../../common/keystone-tweakables/props';
import { UNITS } from '../../common/util/units';
import { CylinderLightboxWidgetModel } from '../../widgets/CylinderLightbox/models';

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

@model('WorkspaceModel')
export class WorkspaceModel extends Model({
  selectedWidgetName: prop('polyhedral-net').withSetter(),
  selectedStore: prop<any>(() => (new PyramidNetWidgetModel({}))).withSetter(),
  preferences: prop(() => (new WorkspacePreferencesModel({}))),
}) {
  widgetOptions = {
    'polyhedral-net': PyramidNetWidgetModel,
    'cylinder-lightbox': CylinderLightboxWidgetModel,
  };

  @observable
  savedSnapshot = undefined;

  @observable
  currentFilePath = undefined;

  onAttachedToRootStore():(() => void) {
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

  @modelAction
  persistPreferences() {
    return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to persist preferences, likely due to data schema changes, '
          + 'resetting preferences to defaults: ', e.message);
        this.resetPreferences();
        return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences);
      });
  }

  @modelAction
  renderWidgetToString() {
    const { WidgetSVG, documentAreaProps } = this.selectedStore;
    return ReactDOMServer.renderToString(
      <SVGWrapper {...documentAreaProps}>
        <WidgetSVG />
      </SVGWrapper>,
    );
  }

  @modelAction
  resetPreferences() {
    localStorage.removeItem(PREFERENCES_LOCALSTORE_NAME);
    this.preferences = new WorkspacePreferencesModel({});
    return this.persistPreferences();
  }

  @modelAction
  resetModelToDefault() {
    detach(this.selectedStore);
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
