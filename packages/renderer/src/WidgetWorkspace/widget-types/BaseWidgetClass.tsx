import { Model, UndoManager, undoMiddleware } from 'mobx-keystone';
import { FC } from 'react';
import { observable } from 'mobx';
import { AdditionalFileMenuItemsProps, AssetDefinition } from './types';

export abstract class BaseWidgetClass extends Model({}) {
  abstract get fileBasename(): string;

  @observable
  history: UndoManager;

  // seems abstract properties can't be optional
  // see https://github.com/Microsoft/TypeScript/issues/6413#issuecomment-361869751
  AdditionalToolbarContent?: () => JSX.Element;

  AdditionalFileMenuItems?: FC<AdditionalFileMenuItemsProps>;

  AdditionalMainContent?: FC;

  PanelContent?: FC;

  abstract get assetDefinition(): AssetDefinition;

  protected onInit() {
    this.history = undoMiddleware(this);
  }
}
