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
import {
  fitToViewer, Tool, TOOL_PAN, Value,
} from 'react-svg-pan-zoom';
import JSZip from 'jszip';
import fileDownload from 'js-file-download';
import { radioProp, switchProp } from '@/common/keystone-tweakables/props';
import { UNITS } from '@/common/util/units';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';
import type { Orientation } from '../index';

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
      options: Object.values(UNITS).map((unit) => ({ value: unit, label: unit })),
      isRow: true,
    }),
    darkModeEnabled: switchProp(true),
    panelSizePercent: prop<number>(33).withSetter(),
    panelOrientation: prop<Orientation>('vertical').withSetter(),
  }) {}

const PREFERENCES_LOCALSTORE_NAME = 'WorkspacePreferencesModel';

export const widgetOptions = new Map();
observable(widgetOptions);
export const widgetIconMap = new Map();
observable(widgetIconMap);

export function widgetModel(modelName: string, previewIcon: string) {
  return function <C extends ModelClass<BaseWidgetClass>>(constructor: C): C {
    const decoratedClass = model(`SvgWidgetStudio/widgets/${modelName}`)(constructor);
    widgetOptions.set(modelName, decoratedClass);
    widgetIconMap.set(modelName, previewIcon);
    return decoratedClass;
  };
}

@model('SvgWidgetStudio/WorkspaceModel')
export class WorkspaceModel extends Model({
  selectedStore: prop<BaseWidgetClass>(undefined).withSetter(),
  preferences: prop(() => (new WorkspacePreferencesModel({}))).withSetter(),
}) {
  @observable
    selectedWidgetModelType: string = null;

  @action
  setSelectedWidgetModelType(selectedWidgetModelType) {
    this.selectedWidgetModelType = selectedWidgetModelType;
  }

  // package used to export INITIAL_VALUE but this somehow works okay
  @observable
    zoomPanValue: Value = {} as Value;

  @observable
    zoomPanTool: Tool = TOOL_PAN;

  @observable
    widgetPickerOpen = false;

  @observable
    alertDialogContent = null;

  @observable
    openWidgetFileFlag = false;

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
      reaction(() => [this.titleBarText], () => {
        document.title = this.titleBarText;
      }, { fireImmediately: true }),
    ];

    this.persistPreferences()
      .then(() => {
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
    return startCase(this.selectedWidgetModelType);
  }

  @computed
  get titleBarText() {
    return `Widget Factory ${
      this.selectedWidgetNameReadable ? `|| ${this.selectedWidgetNameReadable}` : ''}`;
  }

  getSelectedModelAssetsFileData() {
    return this.selectedStore.assetDefinition.getAssetsFileData(
      this.selectedStore.fileBasename,
    );
  }

  @action
  setWidgetPickerOpen(val: boolean) {
    this.widgetPickerOpen = val;
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
    const zip = new JSZip();
    const widgetSpecJSON = this.getWidgetSpecJSON();
    const filePath = `${this.selectedStore.fileBasename}.widget`;
    zip.file(
      filePath,
      JSON.stringify(widgetSpecJSON, null, 2),
    );
    this.getSelectedModelAssetsFileData().forEach(({ filePath, fileString }) => {
      zip.file(filePath, fileString);
    });

    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        // see FileSaver.js
        fileDownload(content, `${this.selectedStore.fileBasename}.zip`);
      });
  }

  @action
  newWidget() {
    if (this.availableWidgetTypes.length > 1) {
      this.setWidgetPickerOpen(true);
    } else {
      this.resetModelToDefault();
    }
  }

  @action
  setAlertDialogContent(content: ReactNode) {
    this.alertDialogContent = content;
  }

  @action
  resetAlertDialogContent() {
    this.alertDialogContent = null;
  }

  @action
  fitToDocument() {
    this.setZoomPanValue(fitToViewer(this.zoomPanValue));
  }

  @action
  setZoomPanTool(tool: Tool) {
    this.zoomPanTool = tool;
  }

  @action
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
    this.setPreferences(new WorkspacePreferencesModel({}));
    return this.persistPreferences();
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
  widgetsReady() {
    if (this.availableWidgetTypes.length === 1) {
      // @ts-ignore
      this.setSelectedWidgetModelType(widgetList[0].$modelType);
      this.resetModelToDefault();
    } else {
      this.newWidget();
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
    applySnapshot(this.selectedStore, persistedSpecSnapshot);
  }

  @modelAction
  setSelectedStoreFromData(widgetType: string, persistedSpecSnapshot: SnapshotInOfModel<any>) {
    this.newWidgetStore(widgetType);
    const { history } = this.selectedStore;
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
