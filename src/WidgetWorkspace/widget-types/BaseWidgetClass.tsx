import { Model, UndoManager, undoMiddleware } from 'mobx-keystone';
import { FC } from 'react';
import { observable } from 'mobx';
import { BaseAssetDefinition } from './types';
import { AdditionalToolbarItem } from '../../widgets/PyramidNet/components/AdditionalToolbarContent';
import { FileMenuItem } from '../components/AdditionalFileMenuItems';

export abstract class BaseWidgetClass extends Model({}) {
  abstract get fileBasename(): string;

  @observable
    history: UndoManager;

  // seems abstract properties can't be optional
  // see https://github.com/Microsoft/TypeScript/issues/6413#issuecomment-361869751
  additionalToolbarContent?: AdditionalToolbarItem[];

  additionalFileMenuItems?: FileMenuItem[];

  AdditionalMainContent?: FC;

  PanelContent?: FC;

  abstract get assetDefinition(): BaseAssetDefinition;

  protected onInit() {
    this.history = undoMiddleware(this);
  }
}
