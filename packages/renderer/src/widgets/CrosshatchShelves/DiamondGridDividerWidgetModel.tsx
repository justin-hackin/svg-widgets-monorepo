import { ExtendedModel, model, prop } from 'mobx-keystone';
import { computed } from 'mobx';
import React from 'react';
import { BaseWidgetClass } from '../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { DiamondGridDividerSavedModel } from './DiamondGridDividerSavedModel';
import { DisjunctAssetsDefinition } from '../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';

@model('DiamondGridDividerWidgetModel')
export class DiamondGridDividerWidgetModel extends ExtendedModel(BaseWidgetClass, {
  savedModel: prop(() => new DiamondGridDividerSavedModel({})),
}) {
  // eslint-disable-next-line class-methods-use-this
  getFileBasename() {
    return 'DiamondShelves';
  }

  specFileExtension = 'dsx';

  @computed
  get assetDefinition() {
    return new DisjunctAssetsDefinition(
      [
        {
          name: 'Profile view',
          documentAreaProps: { width: this.savedModel.shelfWidth.value, height: this.savedModel.shelfHeight.value },
          Component: () => (
            <g>
              <path
                d={this.savedModel.crosshatchProfilePath.getD()}
                fill="none"
                stroke="#ddd"
                strokeWidth={this.savedModel.materialThickness.value}
              />
            </g>
          ),
        },
        ...this.savedModel.panelAssetMembers,
      ], 0, true,
    );
  }
}
