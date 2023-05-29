import { ReactNode } from 'react';
import {
  action, computed, observable, reaction,
} from 'mobx';
import {
  applySnapshot,
  detach,
  getSnapshot,
  model,
  Model,
  modelAction,
  ModelClass,
  prop,
  SnapshotInOfModel,
} from 'mobx-keystone';
import { persist } from 'mobx-keystone-persist';
import { startCase } from 'lodash-es';
import JSZip from 'jszip';
// TODO: remove this dep
import fileDownload from 'js-file-download';
import { BaseWidgetClass } from '../classes/BaseWidgetClass';
import type { Orientation } from '../components/WidgetWorkspace';
import { radioProp, switchProp } from '../props';
import { assertNotNullish } from '../helpers/assert';
import { UNITS } from '../helpers/units';
import { ZoomPanView } from './ZoomPanView';

type WidgetJSON = {
  widget: {
    // it's difficult to create 1-to-1 correspondence between widget model $modelType and persisted spec $modelType
    // so instead we store the $modelType of the widget model for toggling the active widget upon file open
    modelType: string,
    modelSnapshot: SnapshotInOfModel<any>,
  },
  metadata: {
    // for future support of migrations
    version: number,
  }
};

@model('SvgWidgetStudio/WorkspacePreferencesModel')
class WorkspacePreferencesModel extends Model({
    displayUnit: radioProp(UNITS.cm, {
      options: Object.values(UNITS),
      isRow: true,
    }),
    darkModeEnabled: switchProp(true),
    panelSizePercent: prop<number>(33).withSetter(),
    panelOrientation: prop<Orientation>('vertical').withSetter(),
  }) {}

const PREFERENCES_LOCALSTORE_NAME = 'WorkspacePreferencesModel';
const ZOOM_PAN_LOCALSTORE_NAME = 'ZoomPanView';
const SELECTED_STORE_LOCALSTORE_NAME = 'selectedStore';

export const widgetOptions = new Map();
observable(widgetOptions);
export const widgetIconMap = new Map();
observable(widgetIconMap);

export function widgetModel(modelName: string, previewIcon: string) {
  return function <C extends ModelClass<BaseWidgetClass>>(constructor: C): C {
    if (modelName.toLowerCase() === 'new') {
      throw new Error(
        'naming components "new" is not allowed because routing depends on /widgets/new path for widget selection',
      );
    }
    const decoratedClass = model(`SvgWidgetStudio/widgets/${modelName}`)(constructor);
    widgetOptions.set(modelName, decoratedClass);
    widgetIconMap.set(modelName, previewIcon);
    return decoratedClass;
  };
}

@model('SvgWidgetStudio/WorkspaceModel')
export class WorkspaceModel extends Model({
  selectedStore: prop<BaseWidgetClass | undefined>(() => undefined),
  preferences: prop(() => (new WorkspacePreferencesModel({}))).withSetter(),
}) {
  @observable
    selectedWidgetModelType: string | undefined = undefined;

  @action
  setSelectedWidgetModelType(selectedWidgetModelType) {
    this.selectedWidgetModelType = selectedWidgetModelType;
  }

  // package used to export INITIAL_VALUE but this somehow works okay

  @observable
    alertDialogContent: ReactNode | null = null;

  @observable
    openWidgetFileFlag = false;

  @observable
    zoomPanView = new ZoomPanView({});

  // eslint-disable-next-line class-methods-use-this
  @computed
  get availableWidgetTypes() {
    return Array.from(widgetOptions.keys());
  }

  // eslint-disable-next-line class-methods-use-this
  get widgetOptions() {
    return widgetOptions;
  }

  onAttachedToRootStore() {
    const disposers = [
      // title bar changes for file status indication
      reaction(() => [this.documentTitle], () => {
        document.title = this.documentTitle;
      }, { fireImmediately: true }),
    ];

    this.persistModels();

    return () => {
      for (const disposer of disposers) {
        disposer();
      }
    };
  }

  @computed
  get selectedWidgetNameReadable() {
    return startCase(this.selectedWidgetModelType);
  }

  @computed
  get documentTitle() {
    return `SVG Widget Studio ${
      this.selectedWidgetNameReadable ? `⚙️${this.selectedWidgetNameReadable}` : ''}`;
  }

  @action
  _setFileDialogActive(isActive: boolean) {
    if (isActive === this.openWidgetFileFlag) {
      throw new Error(
        '_setFileDialogActive: expected parameter isActive to be different than existing value for openWidgetFileFlag',
      );
    }
    this.openWidgetFileFlag = isActive;
  }

  @action
  activateOpenWidgetFilePicker() {
    this._setFileDialogActive(true);
  }

  @action
  deactivateWidgetFilePicker() {
    this._setFileDialogActive(false);
  }

  downloadWidgetWithAssets() {
    assertNotNullish(this.selectedStore);
    const zip = new JSZip();
    const widgetSpecJSON = this.getWidgetSpecJSON();
    const filePath = `${this.selectedStore.fileBasename}.widget`;
    zip.file(
      filePath,
      JSON.stringify(widgetSpecJSON, null, 2),
    );
    this.selectedStore.getSelectedModelAssetsFileData().forEach(({ filePath, fileString }) => {
      zip.file(filePath, fileString);
    });

    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        // see FileSaver.js
        assertNotNullish(this.selectedStore);
        fileDownload(content, `${this.selectedStore.fileBasename}.zip`);
      });
  }

  @action
  setAlertDialogContent(content: ReactNode) {
    this.alertDialogContent = content;
  }

  @action
  resetAlertDialogContent() {
    this.alertDialogContent = null;
  }

  @modelAction
  async persistPreferences() {
    await persist(PREFERENCES_LOCALSTORE_NAME, this.preferences)
      .catch(async (e) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to persist preferences, likely due to data schema changes, '
          + 'resetting preferences to defaults: ', e.message);
        await this.resetPreferences();
        return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences);
      });
  }

  @modelAction
  async persistSelectedStore() {
    await persist(SELECTED_STORE_LOCALSTORE_NAME, this.selectedStore);
  }

  @modelAction
  async persistModels() {
    await persist(ZOOM_PAN_LOCALSTORE_NAME, this.zoomPanView);
    await this.persistSelectedStore();
    await this.persistPreferences();
  }

  @modelAction
  resetPreferences() {
    // TODO: $$$ reset selectedModel preferences
    localStorage.removeItem(PREFERENCES_LOCALSTORE_NAME);
    this.setPreferences(new WorkspacePreferencesModel({}));
    return this.persistPreferences();
  }

  @modelAction
  setSelectedStore(store) {
    this.selectedStore = store;
    localStorage.removeItem(SELECTED_STORE_LOCALSTORE_NAME);
    this.persistSelectedStore();
  }

  @modelAction
  resetModelToDefault() {
    const SelectedModel = widgetOptions.get(this.selectedWidgetModelType);
    if (this.selectedStore) {
      detach(this.selectedStore);
    }

    if (SelectedModel) {
      const newStore = new SelectedModel({});
      this.setSelectedStore(newStore);
    }
  }

  @action
  newWidgetStore(widgetType: string) {
    if (widgetType !== this.selectedWidgetModelType) {
      this.setSelectedWidgetModelType(widgetType);
    }

    this.resetModelToDefault();
  }

  @modelAction
  applySpecSnapshot(persistedSpecSnapshot: SnapshotInOfModel<any>) {
    assertNotNullish(this.selectedStore);
    applySnapshot(this.selectedStore, persistedSpecSnapshot);
  }

  @modelAction
  setSelectedStoreFromData(widgetType: string, persistedSpecSnapshot: SnapshotInOfModel<any>) {
    this.newWidgetStore(widgetType);
    assertNotNullish(this.selectedStore);
    const { history } = this.selectedStore;
    // created in onInit
    assertNotNullish(history);
    history.withoutUndo(() => {
      this.applySpecSnapshot(persistedSpecSnapshot);
    });
  }

  @modelAction
  initializeWidgetFromSnapshot(widgetJSON: WidgetJSON) {
    const { modelType, modelSnapshot } = widgetJSON.widget;
    if (!widgetOptions.has(modelType)) {
      this.setAlertDialogContent(`Invalid widget spec file: JSON data must contain property widget.$modelType with value
       equal to one of (${this.availableWidgetTypes.join(', ')}) but instead saw ${modelType}`);
      return;
    }

    this.setSelectedStoreFromData(modelType, modelSnapshot);
  }

  getWidgetSpecJSON(): WidgetJSON {
    assertNotNullish(this.selectedWidgetModelType);
    const snapshot = getSnapshot(this.selectedStore);
    return {
      widget: {
        modelType: this.selectedWidgetModelType,
        modelSnapshot: snapshot,
      },
      metadata: {
        version: 1,
      },
    };
  }
}
