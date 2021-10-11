import { ExtendedModel, model, prop } from 'mobx-keystone';
import React from 'react';
import { computed } from 'mobx';
import { BaseWidgetClass } from '../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { CrosshatchShelvesSavedModel } from './CrosshatchShelvesSavedModel';
import { DisjunctAssetsDefinition } from '../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';

@model('CrosshatchShelvesWidgetModel')
export class CrosshatchShelvesWidgetModel extends ExtendedModel(BaseWidgetClass, {
  savedModel: prop<CrosshatchShelvesSavedModel>(() => new CrosshatchShelvesSavedModel({})),
}) {
  specFileExtension = 'cxh';

  // eslint-disable-next-line class-methods-use-this
  getFileBasename() {
    return 'CrossHatchShelves';
  }

  @computed
  get assetDefinition() {
    return new DisjunctAssetsDefinition([
      {
        name: 'Cross-section',
        documentAreaProps: {
          width: this.savedModel.shelfWidth.value,
          height: this.savedModel.shelfHeight.value,
        },
        Component: () => (
          <g>
            <path
              d={this.savedModel.crossSectionPath.getD()}
              fill="none"
              stroke="#ddd"
              strokeWidth={this.savedModel.materialThickness.value}
            />
          </g>
        ),
      },
      {
        name: 'Vertical pane',
        copies: this.savedModel.numCubbiesWide + 1,
        documentAreaProps: {
          height: this.savedModel.shelfHeight.value,
          width: this.savedModel.shelfDepth.value,
        },
        Component: () => (
          <g>
            <path
              d={this.savedModel.verticalPanel.getD()}
              fill="none"
              stroke="red"
              strokeWidth={this.savedModel.strokeWidth}
            />
          </g>
        ),
      },
      {
        name: 'Horizontal pane',
        copies: this.savedModel.numCubbiesHigh + 1,
        documentAreaProps: {
          width: this.savedModel.shelfWidth.value,
          height: this.savedModel.shelfDepth.value,
        },
        Component: () => (
          <g>
            <path
              d={this.savedModel.horizontalPanel.getD()}
              fill="none"
              stroke="green"
              strokeWidth={this.savedModel.strokeWidth}
            />
          </g>
        ),
      },
    ], 0, true);
  }
}
