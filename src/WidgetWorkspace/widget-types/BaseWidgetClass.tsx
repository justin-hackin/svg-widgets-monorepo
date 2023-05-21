import { Model, UndoManager, undoMiddleware } from 'mobx-keystone';
import { FC } from 'react';
import { observable } from 'mobx';
import { WatermarkContentComponent } from '@/common/components/SVGWrapper';
import { BaseAssetDefinition } from './types';
import { AdditionalToolbarItem } from '../../widgets/PyramidNet/components/AdditionalToolbarContent';
import { FileMenuItem } from '../components/AdditionalFileMenuItems';

export abstract class BaseWidgetClass extends Model({}) {
  abstract fileBasename: string;

  @observable
    history: UndoManager | undefined;

  // seems abstract properties can't be optional
  // see https://github.com/Microsoft/TypeScript/issues/6413#issuecomment-361869751
  additionalToolbarContent?: AdditionalToolbarItem[];

  additionalFileMenuItems?: FileMenuItem[];

  AdditionalMainContent?: FC;

  PanelContent?: FC;

  WatermarkContent?: WatermarkContentComponent;

  abstract get assetDefinition(): BaseAssetDefinition;

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
