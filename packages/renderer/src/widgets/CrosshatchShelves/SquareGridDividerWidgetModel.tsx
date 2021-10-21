import { ExtendedModel, model, prop } from 'mobx-keystone';
import React from 'react';
import { computed } from 'mobx';
import { BaseWidgetClass } from '../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { SquareGridDividerSavedModel } from './SquareGridDividerSavedModel';
import { DisjunctAssetsDefinition } from '../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';

@model('SquareGridDividerWidgetModel')
export class SquareGridDividerWidgetModel extends ExtendedModel(BaseWidgetClass, {
  savedModel: prop<SquareGridDividerSavedModel>(() => new SquareGridDividerSavedModel({})),
}) {
  specFileExtension = 'cxh';

  panelSpacingRatio = 1.1;

  // eslint-disable-next-line class-methods-use-this
  getFileBasename() {
    return 'CrossHatchShelves';
  }

  @computed
  get assetDefinition() {
    const vertTransY = this.savedModel.shelfHeight.value * this.panelSpacingRatio;
    const horizTransY = (this.savedModel.shelfHeight.value + this.savedModel.shelfDepth.value) * this.panelSpacingRatio;

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
          viewBox: `${0} ${vertTransY} ${this.savedModel.shelfHeight.value} ${this.savedModel.shelfDepth.value}`,
        },
        Component: () => (
          <g transform={`translate(0, ${vertTransY})`}>
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
          viewBox: `${0} ${horizTransY} ${this.savedModel.shelfWidth.value} ${this.savedModel.shelfDepth.value}`,
        },
        Component: () => (
          <g transform={`translate(0, ${horizTransY})`}>
            <path
              d={this.savedModel.horizontalPanel.getD()}
              fill="none"
              stroke="red"
              strokeWidth={this.savedModel.strokeWidth}
            />
          </g>
        ),
      },
    ], 0, true);
  }
}
