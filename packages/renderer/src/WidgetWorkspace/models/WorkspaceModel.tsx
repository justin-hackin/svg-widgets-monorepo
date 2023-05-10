import { ReactNode } from 'react';
import { computed, observable, reaction } from 'mobx';
import {
  _async,
  _await,
  applySnapshot,
  detach, ExtendedModel,
  getSnapshot,
  model,
  Model,
  modelAction,
  ModelClass,
  modelFlow, ModelProps,
  prop,
  SnapshotInOfModel,
} from 'mobx-keystone';
import { persist } from 'mobx-keystone-persist';
import { startCase } from 'lodash';
import {
  fitToViewer,
  // @ts-ignore
  INITIAL_VALUE,
  Tool,
  TOOL_PAN,
  Value,
} from 'react-svg-pan-zoom';
import { IS_ELECTRON_BUILD } from '../../../../common/constants';
import { radioProp, switchProp } from '../../common/keystone-tweakables/props';
import { UNITS } from '../../common/util/units';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';
import { electronApi } from '../../../../common/electron';

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

@model('WorkspacePreferencesModel')
class WorkspacePreferencesModel extends Model({
    displayUnit: radioProp(UNITS.cm, {
      options: Object.values(UNITS).map((unit) => ({ value: unit, label: unit })),
      isRow: true,
    }),
    darkModeEnabled: switchProp(true),
  }) {}

const PREFERENCES_LOCALSTORE_NAME = 'WorkspacePreferencesModel';

export const widgetOptions = new Map();
observable(widgetOptions);

export function widgetModel(modelName: string) {
  return function <C extends ModelClass<BaseWidgetClass>>(constructor: C): C {
    const decoratedClass = model(modelName)(constructor);
    widgetOptions.set(modelName, decoratedClass);
    return decoratedClass;
  };
}

export function WidgetExtendedModel(modelProps: ModelProps) {
  return ExtendedModel(BaseWidgetClass, modelProps);
}

@model('WorkspaceModel')
export class WorkspaceModel extends Model({
  selectedStore: prop<BaseWidgetClass>(undefined).withSetter(),
  preferences: prop(() => (new WorkspacePreferencesModel({}))),
}) {
  @observable
    selectedWidgetModelType: string = null;

  @observable
    savedSnapshot = undefined;

  @observable
    currentFilePath = undefined;

  @observable
    zoomPanValue: Value = INITIAL_VALUE;

  @observable
    zoomPanTool: Tool = TOOL_PAN;

  @observable
    widgetPickerOpen = false;

  @observable
    alertDialogContent = null;

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
    if (this.availableWidgetTypes.length === 1) {
      // @ts-ignore
      this.selectedWidgetModelType = widgetList[0].$modelType;
      this.resetModelToDefault();
    } else {
      this.newWidget();
    }

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
  get selectedStoreIsSaved() {
    if (!this.selectedStore) { return false; }
    // TODO: consider custom middleware that would obviate the need to compare snapshots on every change,
    // instead flagging history records with the associated file name upon save
    // + creating a middleware variable currentSnapshotIsSaved
    // this will also allow history to become preserved across files with titlebar accuracy
    const currentSnapshot = getSnapshot(this.selectedStore);
    // TODO: why does lodash isEqual fail to accurately compare these and why no comparator with mst?
    return JSON.stringify(this.savedSnapshot) === JSON.stringify(currentSnapshot);
  }

  @computed
  get currentFileName() {
    return this.currentFilePath ? this.currentFilePath : `New ${this.selectedWidgetNameReadable}`;
  }

  @computed
  get fileTitleFragment() {
    return `${this.selectedStoreIsSaved ? '' : '*'}${this.currentFileName}`;
  }

  @computed
  get titleBarText() {
    if (!this.selectedStore) {
      return '';
    }
    return IS_ELECTRON_BUILD
      ? `${this.selectedWidgetNameReadable} ‖ ${this.fileTitleFragment}` : 'Polyhedral Decoration Studio';
  }

  getSelectedModelAssetsFileData() {
    return this.selectedStore.assetDefinition.getAssetsFileData(
      this.selectedStore.fileBasename,
    );
  }

  @modelAction
  setWidgetPickerOpen(val: boolean) {
    this.widgetPickerOpen = val;
  }

  @modelAction
  newWidget() {
    if (this.availableWidgetTypes.length > 1) {
      this.setWidgetPickerOpen(true);
    } else {
      this.resetModelToDefault();
    }
  }

  @modelAction
  setAlertDialogContent(content: ReactNode) {
    this.alertDialogContent = content;
  }

  @modelAction
  resetAlertDialogContent() {
    this.alertDialogContent = null;
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
    const SelectedModel = widgetOptions.get(this.selectedWidgetModelType);
    if (this.selectedStore) {
      detach(this.selectedStore);
    }

    if (SelectedModel) {
      const newStore = new SelectedModel({});
      this.setSelectedStore(newStore);
    }
    this.resetCurrentFileData();
  }

  @modelAction
  newWidgetStore(widgetType: string) {
    if (widgetType !== this.selectedWidgetModelType) {
      this.selectedWidgetModelType = widgetType;
    }

    this.resetModelToDefault();
  }

  @modelAction
  applySpecSnapshot(persistedSpecSnapshot: SnapshotInOfModel<any>) {
    applySnapshot(this.selectedStore, persistedSpecSnapshot);
  }

  @modelAction
  setSelectedStoreFromData(widgetType: string, persistedSpecSnapshot: SnapshotInOfModel<any>, filePath: string) {
    this.newWidgetStore(widgetType);
    this.setCurrentFileData(filePath, persistedSpecSnapshot);
    const { history } = this.selectedStore;
    history.withoutUndo(() => {
      this.applySpecSnapshot(persistedSpecSnapshot);
    });
  }

  @modelAction
  initializeWidgetFromSnapshot(widgetJSON: WidgetJSON, filePath: string) {
    const { modelType, modelSnapshot } = widgetJSON.widget;
    if (!widgetOptions.has(modelType)) {
      this.setAlertDialogContent(`Invalid widget spec file: JSON data must contain property widget.$modelType with value
       equal to one of (${this.availableWidgetTypes.join(', ')}) but instead saw ${modelType}`);
      return;
    }

    this.setSelectedStoreFromData(modelType, modelSnapshot, filePath);
  }

  // @modelAction
  // saveWidget() {
  //   const snapshot = getSnapshot(this.selectedStore.persistedSpec);
  //   const filePath = await electronApi.saveSvgAndAssetsWithDialog(
  //     this.getSelectedModelAssetsFileData(),
  //     snapshot,
  //     'Save assets svg with widget settings',
  //     this.selectedStore.fileBasename,
  //   );
  //
  //   if (filePath) {
  //     this.setCurrentFileData(filePath, snapshot);
  //   }
  // }

  @modelAction
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

  @modelFlow
    saveWidgetWithDialog = _async(function* (this: WorkspaceModel) {
      const widgetJSON = this.getWidgetSpecJSON();
      const filePath = yield* _await(electronApi.saveSvgAndAssetsWithDialog(
        this.getSelectedModelAssetsFileData(),
        widgetJSON,
        'Save assets svg with widget settings',
        this.selectedStore.fileBasename,
      ));

      if (filePath) {
        this.setCurrentFileData(filePath, widgetJSON.widget.modelSnapshot);
      }
    });

  @modelFlow
    saveWidget = _async(function* (this: WorkspaceModel) {
      if (!this.currentFilePath) {
        yield* _await(this.saveWidgetWithDialog());
      } else {
        const widgetJSON = this.getWidgetSpecJSON();
        yield* _await(
          electronApi.saveSvgAndModel(this.getSelectedModelAssetsFileData(), widgetJSON, this.currentFilePath),
        );

        this.setCurrentFileData(this.currentFilePath, widgetJSON.widget.modelSnapshot);
      }
    });

  @modelAction
  resetCurrentFileData() {
    this.currentFilePath = undefined;
    this.savedSnapshot = undefined;
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
