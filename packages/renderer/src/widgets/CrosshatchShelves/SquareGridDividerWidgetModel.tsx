import { ExtendedModel, model, prop } from 'mobx-keystone';
import React from 'react';
import { computed } from 'mobx';
import { BaseWidgetClass } from '../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { DisjunctAssetsDefinition } from '../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import { PathData } from '../../common/path/PathData';
import { radioProp } from '../../common/keystone-tweakables/props';
import { DividerBaseSavedModel } from './DividerBaseSavedModel';
import { getMarginLength, centeredNotchPanel } from './util';

enum REMAINDER_SIZES {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

const cubbiesDecrementOptions = Object.values(REMAINDER_SIZES).map((size, index) => ({ value: index, label: size }));

@model('SquareGridDividerSavedModel')
export class SquareGridDividerSavedModel extends ExtendedModel(DividerBaseSavedModel, {
  widthCubbiesDecrement: radioProp(0, {
    labelOverride: 'Left/right section size',
    options: cubbiesDecrementOptions,
    valueParser: parseInt,
    isRow: true,
  }),
  heightCubbiesDecrement: radioProp(0, {
    labelOverride: 'Top/bottom section size',
    options: cubbiesDecrementOptions,
    valueParser: parseInt,
    isRow: true,
  }),
}) {
  @computed
  get numCubbiesWide() {
    return Math.floor((this.shelfWidth.value - this.materialThickness.value)
      / (this.cubbyWidth.value + this.materialThickness.value)) - this.widthCubbiesDecrement.value;
  }

  @computed
  get numCubbiesHigh() {
    return Math.floor((this.shelfHeight.value - this.materialThickness.value)
      / (this.cubbyWidth.value + this.materialThickness.value)) - this.heightCubbiesDecrement.value;
  }

  @computed
  get horizontalPanel() {
    return centeredNotchPanel(
      this.shelfWidth.value, this.shelfDepth.value,
      this.numCubbiesWide + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
  }

  @computed
  get verticalPanel() {
    return centeredNotchPanel(
      this.shelfHeight.value, this.shelfDepth.value,
      this.numCubbiesHigh + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
  }

  @computed
  get strokeWidth() {
    return Math.max(this.shelfHeight.value, this.shelfWidth.value) * 0.001;
  }

  @computed
  get crossSectionPath() {
    const path = new PathData();
    const widthMargins = getMarginLength(
      this.shelfWidth.value, this.numCubbiesWide + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
    for (let i = 0; i <= this.numCubbiesWide; i += 1) {
      const x = widthMargins + (this.materialThickness.value / 2)
        + (i * (this.cubbyWidth.value + this.materialThickness.value));
      path.move([x, 0]).line([x, this.shelfHeight.value]);
    }

    const heightMargins = getMarginLength(
      this.shelfHeight.value, this.numCubbiesHigh + 1, this.cubbyWidth.value, this.materialThickness.value,
    );
    for (let i = 0; i <= this.numCubbiesHigh; i += 1) {
      const y = heightMargins + (this.materialThickness.value / 2)
        + (i * (this.cubbyWidth.value + this.materialThickness.value));
      path.move([0, y]).line([this.shelfWidth.value, y]);
    }
    return path;
  }
}

@model('SquareGridDividerWidgetModel')
export class SquareGridDividerWidgetModel extends ExtendedModel(BaseWidgetClass, {
  savedModel: prop<SquareGridDividerSavedModel>(() => new SquareGridDividerSavedModel({})),
}) {
  specFileExtension = 'cxh';

  panelSpacingRatio = 1.1;

  // eslint-disable-next-line class-methods-use-this
  get fileBasename() {
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
    ]);
  }
}
