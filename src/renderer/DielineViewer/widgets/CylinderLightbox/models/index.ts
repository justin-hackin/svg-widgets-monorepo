import { Instance, types } from 'mobx-state-tree';
import { reaction } from 'mobx';
import {
  angleRelativeToOrigin,
  getOriginPoint, lineLerp,
  pointFromPolar, sumPoints,
} from '../../../../common/util/geom';
import { DestinationCommand, PathData } from '../../../util/PathData';
import { UndoManagerWithGroupState } from '../../../../common/components/UndoManagerWithGroupState';
import { closedPolygonPath } from '../../../util/shapes/generic';
import { subtractDValues, unifyDValues } from '../../../../common/util/path-boolean';
import { PIXELS_PER_CM, radToDeg } from '../../../../common/util/units';

const getRectanglePoints = ([x1, y1], [x2, y2]) => [
  { x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 },
];

const rectanglePathCenteredOnOrigin = (width, height) => closedPolygonPath(getRectanglePoints(
  [-width / 2, -height / 2],
  [width / 2, height / 2],
));

const polygonSideLength = (numSides, inRadius) => 2 * inRadius * Math.tan(Math.PI / numSides);

const CylinderLightboxDataModel = types.model('Cylinder Lightbox', {
  wallsPerArc: types.optional(types.integer, 4),
  holeWidthRatio: types.optional(types.number, 0.5),
  arcsPerRing: types.optional(types.integer, 4),
  ringRadius: types.optional(types.number, PIXELS_PER_CM * 11.25),
  ringThicknessRatio: types.optional(types.number, 0.2),
  materialThickness: types.optional(types.number, PIXELS_PER_CM * 0.3),
  dovetailIngressRatio: types.optional(types.number, 0.5),
  dovetailSizeRatio: types.optional(types.number, 0.5),
  cylinderHeight: types.optional(types.number, PIXELS_PER_CM * 2),
  holderTabsPerArc: types.optional(types.integer, 2),
  holderTabsFeetLengthRatio: types.optional(types.number, 0.5),
}).volatile(() => ({
  sectionPathD: null,
  wallPathD: null,
}))
  .views((self) => ({
    get innerRadius() {
      return self.ringRadius * (1 - self.ringThicknessRatio);
    },
    get midRadius() {
      return self.ringRadius * (1 - (self.ringThicknessRatio / 2));
    },
    get ringThickness() {
      return self.ringThicknessRatio * self.ringRadius;
    },
    get wallPolygonNumSides() {
      return self.arcsPerRing * self.wallsPerArc;
    },
    // not really the effective max because the holes will overlap when they are touching thus they need some spacing
    get maxHoleWidth() {
      return polygonSideLength(this.wallPolygonNumSides, this.midRadius);
    },
    get actualHoleWidth() {
      return this.maxHoleWidth * self.holeWidthRatio;
    },
    get absNotchPath() {
      const origin = getOriginPoint();
      const distance = self.ringThicknessRatio * self.ringRadius * self.dovetailSizeRatio;

      const basePoint1 = pointFromPolar(Math.PI / 3, distance);
      const basePoint2 = pointFromPolar(Math.PI * (2 / 3), distance);
      const baseMidpoint = lineLerp(basePoint1, basePoint2, 0.5);
      const triangleTranslate = { x: 0, y: -baseMidpoint.y };
      // make midpint of base rest on origin
      const points = [origin, basePoint1, basePoint2].map((pt) => sumPoints(pt, triangleTranslate));
      return closedPolygonPath(points);
    },
    get notchRotationBeforeIngress() {
      return -360.0 / (2 * self.arcsPerRing);
    },
    get maxIngressAngle() {
      const dovetailNotchBeforeIngress = (new PathData()).concatPath(this.absNotchPath)
        .transform(`rotate(${this.notchRotationBeforeIngress}) translate(${this.midRadius}, 0)`);
      const p1 = (dovetailNotchBeforeIngress.commands[0] as DestinationCommand).to;
      const p2 = (dovetailNotchBeforeIngress.commands[1] as DestinationCommand).to;
      return radToDeg(Math.abs(angleRelativeToOrigin(p1) - angleRelativeToOrigin(p2)));
    },
    get ingressAngle() {
      return (this.maxIngressAngle * self.dovetailIngressRatio);
    },
    get notchRotation() {
      return this.notchRotationBeforeIngress + this.ingressAngle;
    },
    get tabRotation() {
      return -this.notchRotationBeforeIngress + this.ingressAngle;
    },
    get dovetailNotch() {
      return (new PathData()).concatPath(this.absNotchPath)
        .transform(`rotate(${this.notchRotation}) translate(${this.midRadius}, 0)`);
    },
    get dovetailTab() {
      return (new PathData()).concatPath(this.absNotchPath)
        .transform(`rotate(${this.tabRotation}) translate(${this.midRadius}, 0)`);
    },
    get wallHoles() {
      const holesPath = new PathData();
      const sectionDegrees = 360 / this.wallPolygonNumSides;
      for (let i = 0; i < self.wallsPerArc; i += 1) {
        const rotation = (i - (self.wallsPerArc / 2) + 0.5) * sectionDegrees;
        const thisHole = rectanglePathCenteredOnOrigin(self.materialThickness, this.actualHoleWidth)
          .transform(`rotate(${rotation}) translate(${this.midRadius}, 0)`);
        holesPath.concatPath(thisHole);
      }
      return holesPath;
    },
    get sectionArcPath() {
      const sectionArcPath = new PathData();
      const halfArcAngle = (2 * Math.PI * 0.5) / self.arcsPerRing;
      const outerArcLeft = pointFromPolar(-halfArcAngle, self.ringRadius);
      const outerArcRight = pointFromPolar(halfArcAngle, self.ringRadius);
      sectionArcPath
        .move(outerArcLeft)
        .ellipticalArc(self.ringRadius, self.ringRadius, 0, true, false, outerArcRight);

      const innerArcRight = pointFromPolar(halfArcAngle, this.innerRadius);
      const innerArcLeft = pointFromPolar(-halfArcAngle, this.innerRadius);
      sectionArcPath
        .line(innerArcRight)
        .ellipticalArc(this.innerRadius, this.innerRadius, 0, false, false, innerArcLeft)
        .line(outerArcLeft);
      return sectionArcPath;
    },
    get innerWallPolygonSideLength() {
      return polygonSideLength(this.wallPolygonNumSides, this.midRadius - self.materialThickness / 2);
    },
    get wallHorizontalRect() {
      return rectanglePathCenteredOnOrigin(
        this.innerWallPolygonSideLength, self.cylinderHeight - 2 * self.materialThickness,
      );
    },
    get wallVerticalRect() {
      return rectanglePathCenteredOnOrigin(this.actualHoleWidth, self.cylinderHeight);
    },
    get holderTabRadius() {
      return this.innerRadius + this.ringThickness / 4 - self.materialThickness / 4;
    },
    get holderTabFeetLengthMax() {
      return (this.ringThickness - self.materialThickness) / 2;
    },
    get actualHolderTabFeetLength() {
      return this.holderTabFeetLengthMax * self.holderTabsFeetLengthRatio;
    },
    get holderTabHoles() {
      const holesPath = new PathData();
      // TODO: extract shared operations with wall holes for DRYness
      const sectionDegrees = 360 / (self.holderTabsPerArc * self.arcsPerRing);
      for (let i = 0; i < self.wallsPerArc; i += 1) {
        const rotation = (i - (self.holderTabsPerArc / 2) + 0.5) * sectionDegrees;
        const thisHole = rectanglePathCenteredOnOrigin(this.actualHolderTabFeetLength, self.materialThickness)
          .transform(`rotate(${rotation}) translate(${this.holderTabRadius}, 0)`);
        holesPath.concatPath(thisHole);
      }
      return holesPath;
    },
    get holderTabFeetCrotchWidth() {
      return (this.holderTabFeetLengthMax - this.actualHolderTabFeetLength) / 2;
    },
    get holderTab() {
      const secondFootStart = this.actualHolderTabFeetLength + this.holderTabFeetCrotchWidth;
      const secondFootEnd = 2 * this.actualHolderTabFeetLength + this.holderTabFeetCrotchWidth;
      const tabTop = -self.materialThickness - this.actualHolderTabFeetLength;
      return (new PathData()).move(getOriginPoint()) // first foot start
        .line({ x: this.actualHolderTabFeetLength, y: 0 }) // first foot end
        .line({ x: this.actualHolderTabFeetLength, y: -self.materialThickness }) // crotch start
        .line({ x: secondFootStart, y: -self.materialThickness }) // crotch end
        .line({ x: secondFootStart, y: 0 }) // second foot start
        .line({ x: secondFootEnd, y: 0 }) // second foot end
        .curvedLineSegments([{ x: secondFootEnd, y: tabTop }, { x: 0, y: tabTop }],
          0.5, true);
    },
    get designBoundaryRadius() {
      return this.innerRadius - this.actualHolderTabFeetLength;
    },
  })).actions((self) => ({
    afterCreate() {
      this.setSectionPathD();
      this.setWallPathD();
      reaction(
        () => [self.dovetailTab, self.dovetailNotch, self.sectionArcPath, self.holderTabHoles, self.wallHoles],
        () => {
          this.setSectionPathD();
        },
      );
      reaction(
        () => [self.wallHorizontalRect, self.wallVerticalRect],
        () => {
          this.setWallPathD();
        },
      );
    },
    setSectionPathD() {
      const subtractionContent = (new PathData())
        .concatPath(self.dovetailNotch)
        .concatPath(self.wallHoles)
        .concatPath(self.holderTabHoles);
      const notchedPathD = subtractDValues(self.sectionArcPath.getD(), subtractionContent.getD());
      self.sectionPathD = unifyDValues(self.dovetailTab.getD(), notchedPathD);
    },
    setWallPathD() {
      self.wallPathD = unifyDValues(self.wallVerticalRect.getD(), self.wallHorizontalRect.getD());
    },
  }));

export interface ICylinderLightboxDataModel extends Instance<typeof CylinderLightboxDataModel> {}

export const CylinderLightBoxModel = types.model({
  history: types.optional(UndoManagerWithGroupState, {}),
  shapeDefinition: types.optional(CylinderLightboxDataModel, {}),
}).actions(() => ({
  getFileBasename() {
    return 'cylinder_lightbox';
  },
}));

export interface ICylinderLightBoxModel extends Instance<typeof CylinderLightBoxModel> {}
