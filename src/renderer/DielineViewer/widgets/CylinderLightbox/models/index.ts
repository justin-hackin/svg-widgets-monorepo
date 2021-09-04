// eslint-disable-next-line max-classes-per-file
import { computed, observable, reaction } from 'mobx';
import {
  model, Model, modelAction, prop,
} from 'mobx-keystone';
import {
  angleRelativeToOrigin,
  getOriginPoint, lineLerp,
  pointFromPolar, sumPoints,
} from '../../../../../common/util/geom';
import { DestinationCommand, PathData } from '../../../util/PathData';
import { closedPolygonPath } from '../../../util/shapes/generic';
import { subtractDValues, unifyDValues } from '../../../../../common/util/path-boolean';
import { PIXELS_PER_CM, radToDeg } from '../../../../../common/util/units';

const getRectanglePoints = ([x1, y1], [x2, y2]) => [
  { x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 },
];

const rectanglePathCenteredOnOrigin = (width, height) => closedPolygonPath(getRectanglePoints(
  [-width / 2, -height / 2],
  [width / 2, height / 2],
));

const polygonSideLength = (numSides, inRadius) => 2 * inRadius * Math.tan(Math.PI / numSides);

@model('CylinderLightboxModel')
export class CylinderLightboxModel extends Model({
  wallsPerArc: prop(4),
  holeWidthRatio: prop(0.5),
  arcsPerRing: prop(4),
  ringRadius: prop(PIXELS_PER_CM * 11.25),
  ringThicknessRatio: prop(0.2),
  materialThickness: prop(PIXELS_PER_CM * 0.3),
  dovetailIngressRatio: prop(0.5),
  dovetailSizeRatio: prop(0.5),
  cylinderHeight: prop(PIXELS_PER_CM * 2),
  holderTabsPerArc: prop(2),
  holderTabsFeetLengthRatio: prop(0.5),
}) {
  @observable
  sectionPathD = null;

  @observable
  wallPathD = null;

  @computed
  get innerRadius() {
    return this.ringRadius * (1 - this.ringThicknessRatio);
  }

  @computed
  get midRadius() {
    return this.ringRadius * (1 - (this.ringThicknessRatio / 2));
  }

  @computed
  get ringThickness() {
    return this.ringThicknessRatio * this.ringRadius;
  }

  @computed
  get wallPolygonNumSides() {
    return this.arcsPerRing * this.wallsPerArc;
  }

  // not really the effective max because the holes will overlap when they are touching thus they need some spacing
  @computed
  get maxHoleWidth() {
    return polygonSideLength(this.wallPolygonNumSides, this.midRadius);
  }

  @computed
  get actualHoleWidth() {
    return this.maxHoleWidth * this.holeWidthRatio;
  }

  @computed
  get absNotchPath() {
    const origin = getOriginPoint();
    const distance = this.ringThicknessRatio * this.ringRadius * this.dovetailSizeRatio;

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
    return -360.0 / (2 * this.arcsPerRing);
  }

  @computed
  get maxIngressAngle() {
    const dovetailNotchBeforeIngress = (new PathData()).concatPath(this.absNotchPath)
      .transform(`rotate(${this.notchRotationBeforeIngress}) translate(${this.midRadius}, 0)`);
    const p1 = (dovetailNotchBeforeIngress.commands[0] as DestinationCommand).to;
    const p2 = (dovetailNotchBeforeIngress.commands[1] as DestinationCommand).to;
    return radToDeg(Math.abs(angleRelativeToOrigin(p1) - angleRelativeToOrigin(p2)));
  }

  @computed
  get ingressAngle() {
    return (this.maxIngressAngle * this.dovetailIngressRatio);
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
      .transform(`rotate(${this.notchRotation}) translate(${this.midRadius}, 0)`);
  }

  @computed
  get dovetailTab() {
    return (new PathData()).concatPath(this.absNotchPath)
      .transform(`rotate(${this.tabRotation}) translate(${this.midRadius}, 0)`);
  }

  @computed
  get wallHoles() {
    const holesPath = new PathData();
    const sectionDegrees = 360 / this.wallPolygonNumSides;
    for (let i = 0; i < this.wallsPerArc; i += 1) {
      const rotation = (i - (this.wallsPerArc / 2) + 0.5) * sectionDegrees;
      const thisHole = rectanglePathCenteredOnOrigin(this.materialThickness, this.actualHoleWidth)
        .transform(`rotate(${rotation}) translate(${this.midRadius}, 0)`);
      holesPath.concatPath(thisHole);
    }
    return holesPath;
  }

  @computed
  get sectionArcPath() {
    const sectionArcPath = new PathData();
    const halfArcAngle = (2 * Math.PI * 0.5) / this.arcsPerRing;
    const outerArcLeft = pointFromPolar(-halfArcAngle, this.ringRadius);
    const outerArcRight = pointFromPolar(halfArcAngle, this.ringRadius);
    sectionArcPath
      .move(outerArcLeft)
      .ellipticalArc(this.ringRadius, this.ringRadius, 0, true, false, outerArcRight);

    const innerArcRight = pointFromPolar(halfArcAngle, this.innerRadius);
    const innerArcLeft = pointFromPolar(-halfArcAngle, this.innerRadius);
    sectionArcPath
      .line(innerArcRight)
      .ellipticalArc(this.innerRadius, this.innerRadius, 0, false, false, innerArcLeft)
      .line(outerArcLeft);
    return sectionArcPath;
  }

  @computed
  get innerWallPolygonSideLength() {
    return polygonSideLength(this.wallPolygonNumSides, this.midRadius - this.materialThickness / 2);
  }

  @computed
  get wallHorizontalRect() {
    return rectanglePathCenteredOnOrigin(
      this.innerWallPolygonSideLength, this.cylinderHeight - 2 * this.materialThickness,
    );
  }

  @computed
  get wallVerticalRect() {
    return rectanglePathCenteredOnOrigin(this.actualHoleWidth, this.cylinderHeight);
  }

  @computed
  get holderTabRadius() {
    return this.innerRadius + this.ringThickness / 4 - this.materialThickness / 4;
  }

  @computed
  get holderTabFeetLengthMax() {
    return (this.ringThickness - this.materialThickness) / 2;
  }

  @computed
  get actualHolderTabFeetLength() {
    return this.holderTabFeetLengthMax * this.holderTabsFeetLengthRatio;
  }

  @computed
  get holderTabHoles() {
    const holesPath = new PathData();
    // TODO: extract shared operations with wall holes for DRYness
    const sectionDegrees = 360 / (this.holderTabsPerArc * this.arcsPerRing);
    for (let i = 0; i < this.wallsPerArc; i += 1) {
      const rotation = (i - (this.holderTabsPerArc / 2) + 0.5) * sectionDegrees;
      const thisHole = rectanglePathCenteredOnOrigin(this.actualHolderTabFeetLength, this.materialThickness)
        .transform(`rotate(${rotation}) translate(${this.holderTabRadius}, 0)`);
      holesPath.concatPath(thisHole);
    }
    return holesPath;
  }

  @computed
  get holderTabFeetCrotchWidth() {
    return (this.holderTabFeetLengthMax - this.actualHolderTabFeetLength) / 2;
  }

  @computed
  get holderTab() {
    const secondFootStart = this.actualHolderTabFeetLength + this.holderTabFeetCrotchWidth;
    const secondFootEnd = 2 * this.actualHolderTabFeetLength + this.holderTabFeetCrotchWidth;
    const tabTop = -this.materialThickness - this.actualHolderTabFeetLength;
    return (new PathData()).move(getOriginPoint()) // first foot start
      .line({ x: this.actualHolderTabFeetLength, y: 0 }) // first foot end
      .line({ x: this.actualHolderTabFeetLength, y: -this.materialThickness }) // crotch start
      .line({ x: secondFootStart, y: -this.materialThickness }) // crotch end
      .line({ x: secondFootStart, y: 0 }) // second foot start
      .line({ x: secondFootEnd, y: 0 }) // second foot end
      .curvedLineSegments([{ x: secondFootEnd, y: tabTop }, { x: 0, y: tabTop }],
        0.5, true);
  }

  @computed
  get designBoundaryRadius() {
    return this.innerRadius - this.actualHolderTabFeetLength;
  }

  onAttachedToRootStore() {
    this.setSectionPathD();
    this.setWallPathD();

    const disposers = [
      reaction(
        () => [this.dovetailTab, this.dovetailNotch, this.sectionArcPath, this.holderTabHoles, this.wallHoles],
        () => {
          this.setSectionPathD();
        },
      ), reaction(
        () => [this.wallHorizontalRect, this.wallVerticalRect],
        () => {
          this.setWallPathD();
        },
      )];

    return () => {
      for (const disposer of disposers) {
        disposer();
      }
    };
  }

  @modelAction
  setSectionPathD() {
    const subtractionContent = (new PathData())
      .concatPath(this.dovetailNotch)
      .concatPath(this.wallHoles)
      .concatPath(this.holderTabHoles);
    const notchedPathD = subtractDValues(this.sectionArcPath.getD(), subtractionContent.getD());
    this.sectionPathD = unifyDValues(this.dovetailTab.getD(), notchedPathD);
  }

  @modelAction
  setWallPathD() {
    this.wallPathD = unifyDValues(this.wallVerticalRect.getD(), this.wallHorizontalRect.getD());
  }
}

@model('CylinderLightBoxModel')
export class CylinderLightBoxModel extends Model({
  shapeDefinition: prop<CylinderLightboxModel>(() => new CylinderLightboxModel({})),
}) {
  // eslint-disable-next-line class-methods-use-this
  getFileBasename() {
    return 'cylinder_lightbox';
  }
}
