import { Model, UndoManager, undoMiddleware } from 'mobx-keystone';
import { FC } from 'react';
import { observable } from 'mobx';
import { SvgIcon } from '@mui/material';
import { AssetDefinition } from './types';

export interface FileMenuItem {
  action: Function,
  MenuIcon: typeof SvgIcon,
  menuText: string,
}

export abstract class BaseWidgetClass extends Model({}) {
  abstract get fileBasename(): string;

  @observable
    history: UndoManager;

  // seems abstract properties can't be optional
  // see https://github.com/Microsoft/TypeScript/issues/6413#issuecomment-361869751
  AdditionalToolbarContent?: () => JSX.Element;

  additionalFileMenuItems?: FileMenuItem[];

  AdditionalMainContent?: FC;

  PanelContent?: FC;

  abstract get assetDefinition(): AssetDefinition;

  protected onInit() {
    this.history = undoMiddleware(this);
  }
}
