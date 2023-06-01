import {
  Model, ModelClass, UndoManager, undoMiddleware,
} from 'mobx-keystone';
import { FC } from 'react';
import { computed, observable } from 'mobx';
import { AdditionalToolbarItem } from '../components/AdditionalToolbarContent';
import type { AnyAssetDefinition, FileMenuItem, WatermarkContentComponent } from '../types';

import { widgetClassToWidgetNameMap } from '../internal/data';

export abstract class BaseWidgetClass extends Model({}) {
  get fileBasename() {
    return this.modelName;
  }

  @computed
  get modelName(): string {
    return widgetClassToWidgetNameMap.get(this.constructor as ModelClass<BaseWidgetClass>) as string;
  }

  @observable
    history: UndoManager | undefined;

  // seems abstract properties can't be optional
  // see https://github.com/Microsoft/TypeScript/issues/6413#issuecomment-361869751
  additionalToolbarContent?: AdditionalToolbarItem[];

  additionalFileMenuItems?: FileMenuItem[];

  PanelContent?: FC;

  WatermarkContent?: WatermarkContentComponent;

  abstract get assetDefinition(): AnyAssetDefinition;

  getSelectedModelAssetsFileData() {
    return this.assetDefinition.getAssetsFileData(
      this.fileBasename,
      this.WatermarkContent,
    );
  }

  protected onInit() {
    this.history = undoMiddleware(this);
  }
}
