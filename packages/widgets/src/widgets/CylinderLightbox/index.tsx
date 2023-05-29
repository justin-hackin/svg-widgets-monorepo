import { computed } from 'mobx';
import React from 'react';
import { ExtendedModel } from 'mobx-keystone';
import { DestinationCommand, PathData } from 'fluent-svg-path-ts';
import {
  BaseWidgetClass,
  DisjunctAssetsDefinition,
  pathDToViewBoxStr,
  PIXELS_PER_CM,
  sliderProp,
  sliderWithTextProp,
  widgetModel,
} from 'svg-widget-studio';
import {
  angleRelativeToOrigin,
  getOriginPoint,
  lineLerp,
  pointFromPolar,
  radToDeg,
  sumPoints,
} from '../../common/util/geom';
import { subtractDValues, unifyDValues } from '../../common/util/path-boolean';
import { appendCurvedLineSegments, closedPolygonPath } from '../../common/shapes/generic';
import widgetPreview from './widget-preview.png';
import { DEFAULT_SLIDER_STEP } from '@/common/constants';

const getRectanglePoints = ([x1, y1], [x2, y2]) => [
  { x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 },
];

const rectanglePathCenteredOnOrigin = (width: number, height:number) => closedPolygonPath(getRectanglePoints(
  [-width / 2, -height / 2],
  [width / 2, height / 2],
));

const polygonSideLength = (numSides: number, inRadius: number) => 2 * inRadius * Math.tan(Math.PI / numSides);

@widgetModel('CylinderLightbox', widgetPreview)
export class CylinderLightboxWidgetModel extends ExtendedModel(BaseWidgetClass, {
  wallsPerArc: sliderProp(4, {
    min: 1, max: 16, step: 1,
  }),
  holeWidthRatio: sliderProp(0.5, {
    min: 0.1, max: 0.9, step: DEFAULT_SLIDER_STEP,
  }),
  arcsPerRing: sliderProp(4, {
    min: 2, max: 16, step: 1,
  }),
  ringRadius: sliderWithTextProp(PIXELS_PER_CM * 11.25, {
    min: PIXELS_PER_CM * 10, max: PIXELS_PER_CM * 60, step: 0.25 * PIXELS_PER_CM, useUnits: true,
  }),
  ringThicknessRatio: sliderWithTextProp(0.2, {
    min: 0.1, max: 0.5, step: DEFAULT_SLIDER_STEP,
  }),
  materialThickness: sliderWithTextProp(PIXELS_PER_CM * 0.3, {
    min: PIXELS_PER_CM * 0.1, max: PIXELS_PER_CM, step: DEFAULT_SLIDER_STEP, useUnits: true,
  }),
  dovetailIngressRatio: sliderWithTextProp(0.5, {
    min: 0, max: 1, step: DEFAULT_SLIDER_STEP,
  }),
  dovetailSizeRatio: sliderWithTextProp(0.5, {
    min: 0, max: 1, step: DEFAULT_SLIDER_STEP,
  }),
  cylinderHeight: sliderWithTextProp(PIXELS_PER_CM * 2, {
    min: PIXELS_PER_CM, max: PIXELS_PER_CM * 30, step: 0.1 * PIXELS_PER_CM, useUnits: true,
  }),
  holderTabsPerArc: sliderProp(2, {
    min: 1, max: 16, step: 1,
  }),
  holderTabsFeetLengthRatio: sliderWithTextProp(0.5, {
    min: 0, max: 1, step: DEFAULT_SLIDER_STEP,
  }),
}) {
  get ringRadiusVal() {
    return this.ringRadius.value;
  }

  @computed
  get innerRadius() {
    return this.ringRadius.value * (1 - this.ringThicknessRatio.value);
  }

  @computed
  get midRadius() {
    return this.ringRadius.value * (1 - (this.ringThicknessRatio.value / 2));
  }

  @computed
  get ringThickness() {
    return this.ringThicknessRatio.value * this.ringRadius.value;
  }

  @computed
  get wallPolygonNumSides() {
    return this.arcsPerRing.value * this.wallsPerArc.value;
  }

  // not really the effective max because the holes will overlap when they are touching thus they need some spacing
  @computed
  get maxHoleWidth() {
    return polygonSideLength(this.wallPolygonNumSides, this.midRadius);
  }

  @computed
  get actualHoleWidth() {
    return this.maxHoleWidth * this.holeWidthRatio.value;
  }

  @computed
  get absNotchPath() {
    const origin = getOriginPoint();
    const distance = this.ringThicknessRatio.value * this.ringRadius.value * this.dovetailSizeRatio.value;

    const basePoint1 = pointFromPolar(Math.PI / 3, distance);
    const basePoint2 = pointFromPolar(Math.PI * (2 / 3), distance);
    const baseMidpoint = lineLerp(basePoint1, basePoint2, 0.5);
    const triangleTranslate = { x: 0, y: -baseMidpoint.y };
    // make midpint of base rest on origin
    const points = [origin, basePoint1, basePoint2].map((pt) => sumPoints(pt, triangleTranslate));
    return closedPolygonPath(points);
  }

  @computed
  get notchRotationBeforeIngress() {
    return -360.0 / (2 * this.arcsPerRing.value);
  }

  @computed
  get maxIngressAngle() {
    const dovetailNotchBeforeIngress = (new PathData()).concatPath(this.absNotchPath)
      .transformByMatrix(
        (new DOMMatrixReadOnly()).rotate(this.notchRotationBeforeIngress).translate(this.midRadius, 0),
      );
    const p1 = (dovetailNotchBeforeIngress.commands[0] as DestinationCommand).to;
    const p2 = (dovetailNotchBeforeIngress.commands[1] as DestinationCommand).to;
    return radToDeg(Math.abs(angleRelativeToOrigin(p1) - angleRelativeToOrigin(p2)));
  }

  @computed
  get ingressAngle() {
    return (this.maxIngressAngle * this.dovetailIngressRatio.value);
  }

  @computed
  get notchRotation() {
    return this.notchRotationBeforeIngress + this.ingressAngle;
  }

  @computed
  get tabRotation() {
    return -this.notchRotationBeforeIngress + this.ingressAngle;
  }

  @computed
  get dovetailNotch() {
    return (new PathData()).concatPath(this.absNotchPath)
      .transformByMatrix(new DOMMatrixReadOnly().rotate(this.notchRotation).translate(this.midRadius, 0));
  }

  @computed
  get dovetailTab() {
    return (new PathData()).concatPath(this.absNotchPath)
      .transformByMatrix(new DOMMatrixReadOnly().rotate(this.tabRotation).translate(this.midRadius, 0));
  }

  @computed
  get wallHoles() {
    const holesPath = new PathData();
    const sectionDegrees = 360 / this.wallPolygonNumSides;
    for (let i = 0; i < this.wallsPerArc.value; i += 1) {
      const rotation = (i - (this.wallsPerArc.value / 2) + 0.5) * sectionDegrees;
      const thisHole = rectanglePathCenteredOnOrigin(this.materialThickness.value, this.actualHoleWidth)
        .transformByMatrix(new DOMMatrixReadOnly().rotate(rotation).translate(this.midRadius, 0));
      holesPath.concatPath(thisHole);
    }
    return holesPath;
  }

  @computed
  get sectionArcPath() {
    const sectionArcPath = new PathData();
    const halfArcAngle = (2 * Math.PI * 0.5) / this.arcsPerRing.value;
    const outerArcLeft = pointFromPolar(-halfArcAngle, this.ringRadius.value);
    const outerArcRight = pointFromPolar(halfArcAngle, this.ringRadius.value);
    sectionArcPath
      .move(outerArcLeft)
      .ellipticalArc(this.ringRadius.value, this.ringRadius.value, 0, false, true, outerArcRight);

    const innerArcRight = pointFromPolar(halfArcAngle, this.innerRadius);
    const innerArcLeft = pointFromPolar(-halfArcAngle, this.innerRadius);
    sectionArcPath
      .line(innerArcRight)
      .ellipticalArc(this.innerRadius, this.innerRadius, 0, false, false, innerArcLeft)
      .line(outerArcLeft);
    return sectionArcPath;
  }

  @computed
  get sectionPathD() {
    const subtractionContent = (new PathData())
      .concatPath(this.dovetailNotch)
      .concatPath(this.wallHoles)
      .concatPath(this.holderTabHoles);
    const notchedPathD = subtractDValues(this.sectionArcPath.getD(), subtractionContent.getD());
    return unifyDValues(this.dovetailTab.getD(), notchedPathD);
  }

  @computed
  get innerWallPolygonSideLength() {
    return polygonSideLength(this.wallPolygonNumSides, this.midRadius - this.materialThickness.value / 2);
  }

  @computed
  get wallHorizontalRect() {
    return rectanglePathCenteredOnOrigin(
      this.innerWallPolygonSideLength,
      this.cylinderHeight.value - 2 * this.materialThickness.value,
    );
  }

  @computed
  get wallVerticalRect() {
    return rectanglePathCenteredOnOrigin(this.actualHoleWidth, this.cylinderHeight.value);
  }

  @computed
  get holderTabRadius() {
    return this.innerRadius + this.ringThickness / 4 - this.materialThickness.value / 4;
  }

  @computed
  get holderTabFeetLengthMax() {
    return (this.ringThickness - this.materialThickness.value) / 2;
  }

  @computed
  get actualHolderTabFeetLength() {
    return this.holderTabFeetLengthMax * this.holderTabsFeetLengthRatio.value;
  }

  @computed
  get holderTabHoles() {
    const holesPath = new PathData();
    // TODO: extract shared operations with wall holes for DRYness
    const sectionDegrees = 360 / (this.holderTabsPerArc.value * this.arcsPerRing.value);
    for (let i = 0; i < this.holderTabsPerArc.value; i += 1) {
      const rotation = (i - (this.holderTabsPerArc.value / 2) + 0.5) * sectionDegrees;
      const thisHole = rectanglePathCenteredOnOrigin(this.actualHolderTabFeetLength, this.materialThickness.value)
        .transformByMatrix(new DOMMatrixReadOnly().rotate(rotation).translate(this.holderTabRadius, 0));
      holesPath.concatPath(thisHole);
    }
    return holesPath;
  }

  @computed
  get holderTabFeetCrotchWidth() {
    return (this.holderTabFeetLengthMax - this.actualHolderTabFeetLength) / 2;
  }

  @computed
  get holderTabD() {
    const secondFootStart = this.actualHolderTabFeetLength + this.holderTabFeetCrotchWidth;
    const secondFootEnd = 2 * this.actualHolderTabFeetLength + this.holderTabFeetCrotchWidth;
    const tabTop = -this.materialThickness.value - this.actualHolderTabFeetLength;
    const tab = (new PathData()).move(getOriginPoint()) // first foot start
      .line({ x: this.actualHolderTabFeetLength, y: 0 }) // first foot end
      .line({ x: this.actualHolderTabFeetLength, y: -this.materialThickness.value }) // crotch start
      .line({ x: secondFootStart, y: -this.materialThickness.value }) // crotch end
      .line({ x: secondFootStart, y: 0 }) // second foot start
      .line({ x: secondFootEnd, y: 0 }); // second foot end

    appendCurvedLineSegments(
      tab,
      [{ x: secondFootEnd, y: tabTop }, { x: 0, y: tabTop }],
      0.5,
      true,
    );
    return tab.getD();
  }

  @computed
  get designBoundaryRadius() {
    return this.innerRadius - this.actualHolderTabFeetLength;
  }

  @computed
  get wallPathD() {
    return unifyDValues(this.wallVerticalRect.getD(), this.wallHorizontalRect.getD());
  }

  @computed
  get assetDefinition() {
    return new DisjunctAssetsDefinition([
      {
        name: 'Face boundaries',
        documentAreaProps: {
          viewBox: `${-this.ringRadiusVal} ${-this.ringRadiusVal} ${this.ringRadiusVal * 2} ${this.ringRadiusVal * 2}`,
        },
        Component: () => (
          <g>
            <circle r={this.ringRadius.value} fill="none" stroke="red" />
            <circle r={this.innerRadius} fill="none" stroke="green" />
            <circle r={this.designBoundaryRadius} fill="none" stroke="blue" />
          </g>
        ),
        copies: 1,
      },
      {
        name: 'Wall',
        Component: () => (
          <g>
            <path d={this.wallPathD} fill="white" stroke="black" />
          </g>
        ),
        documentAreaProps: { viewBox: pathDToViewBoxStr(this.wallPathD) },
        copies: this.wallsPerArc.value * this.arcsPerRing.value,
      },
      {
        name: 'Arc',
        Component: () => (
          <g>
            <path d={this.sectionPathD} fill="white" stroke="black" fillRule="evenodd" />
          </g>
        ),
        documentAreaProps: { viewBox: pathDToViewBoxStr(this.sectionPathD) },
        copies: this.arcsPerRing.value * 2,
      },
      {
        name: 'Diffuser holder',
        Component: () => (
          <g>
            <path d={this.holderTabD} fill="blue" stroke="black" fillRule="evenodd" />
          </g>
        ),
        documentAreaProps: { viewBox: pathDToViewBoxStr(this.holderTabD) },
        copies: this.holderTabsPerArc.value * this.arcsPerRing.value,
      },
    ]);
  }
}
