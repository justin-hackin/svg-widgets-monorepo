import { ExtendedModel } from 'mobx-keystone';
import React from 'react';
import { computed } from 'mobx';
import { LicenseWatermarkContent } from '@/widgets/LicenseWatermarkContent';
import { DisjunctAssetsDefinition } from '../../WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import { PathData } from '../../common/path/PathData';
import { radioProp } from '../../common/keystone-tweakables/props';
import { dividerBaseModelProps } from './DividerBasePersistedSpec';
import { centeredNotchPanel, getMarginLength } from './util';
import { BaseWidgetClass } from '../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { widgetModel } from '../../WidgetWorkspace/models/WorkspaceModel';
import widgetPreview from './previews/square-grid-divider.png';

enum REMAINDER_SIZES {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

const cubbiesDecrementOptions = Object.values(REMAINDER_SIZES).map((size, index) => ({ value: index, label: size }));

@widgetModel('SquareGridDivider', widgetPreview)
export class SquareGridDividerWidgetModel extends ExtendedModel(BaseWidgetClass, {
  ...dividerBaseModelProps,
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
  panelSpacingRatio = 1.1;

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
      this.shelfWidth.value,
      this.shelfDepth.value,
      this.numCubbiesWide + 1,
      this.cubbyWidth.value,
      this.materialThickness.value,
    );
  }

  @computed
  get verticalPanel() {
    return centeredNotchPanel(
      this.shelfHeight.value,
      this.shelfDepth.value,
      this.numCubbiesHigh + 1,
      this.cubbyWidth.value,
      this.materialThickness.value,
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
      this.shelfWidth.value,
      this.numCubbiesWide + 1,
      this.cubbyWidth.value,
      this.materialThickness.value,
    );
    for (let i = 0; i <= this.numCubbiesWide; i += 1) {
      const x = widthMargins + (this.materialThickness.value / 2)
        + (i * (this.cubbyWidth.value + this.materialThickness.value));
      path.move([x, 0]).line([x, this.shelfHeight.value]);
    }

    const heightMargins = getMarginLength(
      this.shelfHeight.value,
      this.numCubbiesHigh + 1,
      this.cubbyWidth.value,
      this.materialThickness.value,
    );
    for (let i = 0; i <= this.numCubbiesHigh; i += 1) {
      const y = heightMargins + (this.materialThickness.value / 2)
        + (i * (this.cubbyWidth.value + this.materialThickness.value));
      path.move([0, y]).line([this.shelfWidth.value, y]);
    }
    return path;
  }

  fileBasename = 'CrossHatchShelves';

  @computed
  get assetDefinition() {
    const vertTransY = this.shelfHeight.value * this.panelSpacingRatio;
    const horizTransY = (this.shelfHeight.value
      + this.shelfDepth.value) * this.panelSpacingRatio;

    return new DisjunctAssetsDefinition([
      {
        name: 'Cross-section',
        documentAreaProps: {
          width: this.shelfWidth.value,
          height: this.shelfHeight.value,
        },
        Component: () => (
          <g>
            <path
              d={this.crossSectionPath.getD()}
              fill="none"
              stroke="#ddd"
              strokeWidth={this.materialThickness.value}
            />
          </g>
        ),
      },
      {
        name: 'Vertical pane',
        copies: this.numCubbiesWide + 1,
        documentAreaProps: {
          viewBox: `${0} ${vertTransY} ${this.shelfHeight.value} ${this.shelfDepth.value}`,
        },
        Component: () => (
          <g transform={`translate(0, ${vertTransY})`}>
            <path
              d={this.verticalPanel.getD()}
              fill="none"
              stroke="red"
              strokeWidth={this.strokeWidth}
            />
          </g>
        ),
      },
      {
        name: 'Horizontal pane',
        copies: this.numCubbiesHigh + 1,
        documentAreaProps: {
          viewBox: `${0} ${horizTransY} ${this.shelfWidth.value} ${this.shelfDepth.value}`,
        },
        Component: () => (
          <g transform={`translate(0, ${horizTransY})`}>
            <path
              d={this.horizontalPanel.getD()}
              fill="none"
              stroke="red"
              strokeWidth={this.strokeWidth}
            />
          </g>
        ),
      },
    ]);
  }

  WatermarkContent = LicenseWatermarkContent;
}
