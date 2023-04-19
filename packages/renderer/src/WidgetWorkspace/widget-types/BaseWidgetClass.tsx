import { Model, ModelProp } from 'mobx-keystone';
import { FC } from 'react';
import { AdditionalFileMenuItemsProps, AssetDefinition } from './types';

export abstract class BaseWidgetClass extends Model({}) {
  abstract savedModel: ModelProp<any, any, false, false, true>;

  abstract get fileBasename(): string;

  // seems abstract properties can't be optional
  // see https://github.com/Microsoft/TypeScript/issues/6413#issuecomment-361869751
  AdditionalToolbarContent?: () => JSX.Element;

  AdditionalFileMenuItems?: FC<AdditionalFileMenuItemsProps>;

  AdditionalMainContent?: FC;

  PanelContent?: FC;

  abstract get assetDefinition(): AssetDefinition;
}
