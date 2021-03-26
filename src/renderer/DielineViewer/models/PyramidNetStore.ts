/* eslint-disable no-param-reassign */
import {
  getParent, getType, Instance, resolveIdentifier, types,
} from 'mobx-state-tree';
import {
  chunk, flatten, range, isInteger,
} from 'lodash';
import { polyhedra } from '../data/polyhedra';
import {
  hingedPlot,
  hingedPlotByProjectionDistance,
  offsetPolygonPoints,
  polygonPointsGivenAnglesAndSides,
  RawPoint,
  scalePoint,
  sumPoints,
  triangleAnglesGivenSides,
} from '../../common/util/geom';
import { closedPolygonPath, roundedEdgePath } from '../util/shapes/generic';
import {
  AscendantEdgeConnectionPaths,
  ascendantEdgeConnectionTabs,
  AscendantEdgeTabsModel,
} from '../util/shapes/ascendantEdgeConnectionTabs';
import { baseEdgeConnectionTab, BaseEdgeTabsModel } from '../util/shapes/baseEdgeConnectionTab';
import { DashPatternModel, defaultStrokeDashSpec, strokeDashPath } from '../util/shapes/strokeDashPath';
import { boundingViewBoxAttrs } from '../../../common/util/svg';
import { StrokeDashPathPatternModel } from '../data/dash-patterns';
import { getBoundedTexturePathD } from '../../common/util/path-boolean';
import { PathData } from '../util/PathData';
import { degToRad, PIXELS_PER_CM, radToDeg } from '../../common/util/units';
import {
  IPathFaceDecorationPatternModel,
  PathFaceDecorationPatternModel,
} from '../../common/models/PathFaceDecorationPatternModel';
import { ITextureFaceDecorationModel, TextureFaceDecorationModel } from './TextureFaceDecorationModel';
import { IRawFaceDecorationModel, RawFaceDecorationModel } from './RawFaceDecorationModel';
import { UndoManagerWithGroupState } from '../../common/components/UndoManagerWithGroupState';

export const FACE_FIRST_EDGE_NORMALIZED_SIZE = 2000;

const getDivisors = (num) => {
  if (!isInteger(num)) {
    throw new Error(`getDivisors expects integer as parameter but received: ${num}`);
  }
  // yes there are more efficient algorithms but input num unlikely to be a large number here
  // package integer-divisors emits regeneratorRuntime errors
  const divisors = [];
  // eslint-disable-next-line for-direction
  for (let div = num; div >= 1; div -= 1) {
    if (isInteger(num / div)) { divisors.push(div); }
  }
  return divisors;
};

const applyFlap = (
  path: PathData, flapDirectionIsUp: boolean,
  handleFlapDepth: number, testTabHandleFlapRounding: number,
) => {
  const startPt = path.lastPosition;
  const endPt = path.currentSegmentStart;
  const startFlapEdge = { x: 0, y: (flapDirectionIsUp ? 1 : -1) * handleFlapDepth };
  path.curvedLineSegments([
    sumPoints(startPt, startFlapEdge),
    sumPoints(endPt, startFlapEdge),
  ], testTabHandleFlapRounding, true);
};

export const PyramidModel = types.model('Pyramid', {
  shapeName: types.optional(types.string, 'small-triambic-icosahedron'),
  netsPerPyramid: types.optional(types.integer, 1),
}).views((self) => ({
  get geometry() {
    return polyhedra[self.shapeName];
  },
  get faceIsSymmetrical() {
    return this.geometry.uniqueFaceEdgeLengths.length < 3;
  },
  // allows multiple nets to build a single pyramid e.g. one face per net
  get netsPerPyramidOptions() {
    // TODO: re-enable this as integer divisors of face count, integer-divisor npm emits regeneratorRuntime errors
    return getDivisors(this.geometry.faceCount)
    // can't apply ascendant edge tabs to an odd number of faces because male & female edge lengths not equal
      .filter((divisor) => this.faceIsSymmetrical || (divisor % 2 !== 0 || divisor === 1));
  },
  get facesPerNet() {
    return this.geometry.faceCount / self.netsPerPyramid;
  },
}));
const FaceDecorationModel = types.union(TextureFaceDecorationModel, RawFaceDecorationModel);

export const PyramidNetModel = types.model('Pyramid Net', {
  pyramid: types.optional(PyramidModel, {}),
  ascendantEdgeTabsSpec: types.optional(AscendantEdgeTabsModel, {}),
  baseEdgeTabsSpec: types.optional(BaseEdgeTabsModel, {}),
  shapeHeight: types.optional(types.number, 20 * PIXELS_PER_CM),
  faceDecoration: types.maybe(FaceDecorationModel),
  useDottedStroke: types.optional(types.boolean, false),
  baseScoreDashSpec: types.maybe(DashPatternModel),
  interFaceScoreDashSpec: types.maybe(DashPatternModel),
})
  .volatile((self) => ({
    testTabHandleFlapDepth: 2,
    testTabHandleFlapRounding: 0.5,
    history: UndoManagerWithGroupState.create({}, { targetStore: self }),
  }))
  .views((self) => ({
    get tabIntervalRatios() {
      const {
        tabsCount, tabStartGapToTabDepth, tabDepthToTraversalLength, holeWidthRatio,
      } = self.ascendantEdgeTabsSpec;
      const offsetRatio = tabDepthToTraversalLength * tabStartGapToTabDepth;
      const intervalRatio = (1 - offsetRatio) / tabsCount;
      const tabWidthRatio = intervalRatio * holeWidthRatio;
      return range(tabsCount)
        .map((index) => [
          offsetRatio + index * intervalRatio,
          offsetRatio + index * intervalRatio + tabWidthRatio,
        ]);
    },

    get relativeFaceEdgeLengths() {
      if (self.pyramid.geometry.uniqueFaceEdgeLengths.length === 3) {
        return self.pyramid.geometry.uniqueFaceEdgeLengths;
      }
      const firstLength = self.pyramid.geometry.uniqueFaceEdgeLengths[0];
      if (self.pyramid.geometry.uniqueFaceEdgeLengths.length === 2) {
        return [...self.pyramid.geometry.uniqueFaceEdgeLengths, firstLength];
      }
      return [firstLength, firstLength, firstLength];
    },

    get tabGapIntervalRatios() {
      return chunk([0, ...flatten(this.tabIntervalRatios), 1], 2);
    },

    get faceEdgeNormalizer() {
      return FACE_FIRST_EDGE_NORMALIZED_SIZE / this.relativeFaceEdgeLengths[0];
    },

    get normalizedFaceEdgeLengths() {
      return this.relativeFaceEdgeLengths.map(
        // @ts-ignore
        (val) => val * self.faceEdgeNormalizer,
      );
    },

    get faceInteriorAngles(): number[] {
      return triangleAnglesGivenSides(this.normalizedFaceEdgeLengths);
    },

    get faceBoundaryPoints() {
      return polygonPointsGivenAnglesAndSides(this.faceInteriorAngles, this.actualFaceEdgeLengths);
    },

    get normalizedDecorationBoundaryPoints():RawPoint[] {
      return polygonPointsGivenAnglesAndSides(
        this.faceInteriorAngles,
        this.normalizedFaceEdgeLengths,
      );
    },

    // factor to scale face lengths such that the first edge will be equal to 1
    get faceLengthAdjustRatio() {
      const { shapeHeight } = self;
      const { diameter } = self.pyramid.geometry;
      const firstSideLengthInPx = ((shapeHeight * this.relativeFaceEdgeLengths[0]) / diameter);
      return firstSideLengthInPx / FACE_FIRST_EDGE_NORMALIZED_SIZE;
    },

    get actualFaceEdgeLengths() {
      return this.normalizedFaceEdgeLengths.map((len) => len * this.faceLengthAdjustRatio);
    },

    get ascendantEdgeTabDepth() {
      const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = self;
      return this.actualFaceEdgeLengths[0] * tabDepthToTraversalLength;
    },

    get borderToInsetRatio() {
      const insetPolygonPoints = offsetPolygonPoints(this.faceBoundaryPoints, -this.ascendantEdgeTabDepth);
      return boundingViewBoxAttrs(closedPolygonPath(this.faceBoundaryPoints).getD()).width
        / boundingViewBoxAttrs(closedPolygonPath(insetPolygonPoints).getD()).width;
    },

    get insetToBorderOffset() {
      const normalizedInsetPoints = offsetPolygonPoints(
        this.normalizedDecorationBoundaryPoints,
        -this.ascendantEdgeTabDepth / this.faceLengthAdjustRatio,
      );
      return scalePoint(normalizedInsetPoints[0], -this.borderToInsetRatio);
    },

    get faceTabFenceposts() {
      const { pyramid: { facesPerNet } } = self;
      const { faceBoundaryPoints, faceInteriorAngles, actualFaceEdgeLengths } = this;
      return range(facesPerNet + 1).map(
        (index) => hingedPlot(
          faceBoundaryPoints[1], faceBoundaryPoints[0], Math.PI * 2 - index * faceInteriorAngles[2],
          index % 2 ? actualFaceEdgeLengths[2] : actualFaceEdgeLengths[0],
        ),
      );
    },

    get baseTabDepth() {
      return self.baseEdgeTabsSpec.tabDepthToAscendantTabDepth * this.ascendantEdgeTabDepth;
    },

    get masterBaseTab() {
      return baseEdgeConnectionTab(
        this.faceBoundaryPoints[1], this.faceBoundaryPoints[2],
        this.baseTabDepth, self.baseEdgeTabsSpec, self.baseScoreDashSpec,
      );
    },

    get masterBaseTabCut() {
      return (new PathData()).concatPath(this.masterBaseTab.innerCut).concatPath(this.masterBaseTab.boundaryCut);
    },

    get masterBaseTabScore() {
      return this.masterBaseTab.score;
    },

    get testBaseTab() {
      const endPt = { x: this.actualFaceEdgeLengths[1], y: 0 };
      const { boundaryCut, innerCut, score } = baseEdgeConnectionTab(
        this.faceBoundaryPoints[0], endPt,
        this.baseTabDepth, self.baseEdgeTabsSpec, self.baseScoreDashSpec,
      );
      const cut = (new PathData()).concatPath(innerCut).concatPath(boundaryCut);
      applyFlap(cut, false,
        self.testTabHandleFlapDepth * this.baseTabDepth, self.testTabHandleFlapRounding);
      return { cut, score };
    },

    get testAscendantTab(): AscendantEdgeConnectionPaths {
      const startPt = this.faceBoundaryPoints[0];
      const endPt = { x: this.actualFaceEdgeLengths[0], y: 0 };

      const { male, female } = ascendantEdgeConnectionTabs(
        startPt, endPt,
        self.ascendantEdgeTabsSpec, self.interFaceScoreDashSpec, this.tabIntervalRatios, this.tabGapIntervalRatios,
      );
      female.cut
        .concatPath(this.testTabFemaleAscendantFlap);

      applyFlap(male.cut, false,
        self.testTabHandleFlapDepth * this.baseTabDepth, self.testTabHandleFlapRounding);
      applyFlap(female.cut, true,
        self.testTabHandleFlapDepth * this.baseTabDepth, self.testTabHandleFlapRounding);
      return { male, female };
    },

    computeFemaleAscendantFlap(start, end) {
      // female tab outer flap
      const remainderGapAngle = 2 * Math.PI - this.faceInteriorAngles[2] * self.pyramid.geometry.faceCount;
      if (remainderGapAngle < 0) {
        throw new Error('too many faces: the sum of angles at apex is greater than 360 degrees');
      }
      const FLAP_APEX_IMPINGE_MARGIN = Math.PI / 12;
      const FLAP_BASE_ANGLE = degToRad(60);

      const flapApexAngle = Math.min(remainderGapAngle - FLAP_APEX_IMPINGE_MARGIN, this.faceInteriorAngles[2]);
      const outerPt1 = hingedPlotByProjectionDistance(
        end, start, flapApexAngle, -this.ascendantEdgeTabDepth,
      );
      const outerPt2 = hingedPlotByProjectionDistance(
        start, end, -FLAP_BASE_ANGLE, this.ascendantEdgeTabDepth,
      );

      return roundedEdgePath(
        [start, outerPt1, outerPt2, end],
        self.ascendantEdgeTabsSpec.flapRoundingDistanceRatio,
      );
    },

    get femaleAscendantFlap() {
      return this.computeFemaleAscendantFlap(this.faceBoundaryPoints[0], this.faceBoundaryPoints[1]);
    },

    get testTabFemaleAscendantFlap() {
      return this.computeFemaleAscendantFlap({ x: this.actualFaceEdgeLengths[0], y: 0 }, this.faceBoundaryPoints[0]);
    },

    get nonTabbedAscendantScores() {
      // inter-face scoring
      return this.faceTabFenceposts.slice(1, -1).reduce((path, endPt) => {
        const pathData = strokeDashPath(this.faceBoundaryPoints[0], endPt, self.interFaceScoreDashSpec);
        return path.concatPath(pathData);
      }, (new PathData()));
    },

    get ascendantEdgeTabs() {
      const ascendantTabs = ascendantEdgeConnectionTabs(
        this.faceBoundaryPoints[1], this.faceBoundaryPoints[0],
        self.ascendantEdgeTabsSpec, self.interFaceScoreDashSpec, this.tabIntervalRatios, this.tabGapIntervalRatios,
      );
      const rotationMatrix = `rotate(${radToDeg(-self.pyramid.facesPerNet * this.faceInteriorAngles[2])})`;
      ascendantTabs.male.cut.transform(rotationMatrix);
      ascendantTabs.male.score.transform(rotationMatrix);
      return ascendantTabs;
    },

    get netPaths() {
      const { baseScoreDashSpec, baseEdgeTabsSpec } = self;
      const { baseTabDepth, faceTabFenceposts } = this;
      const score = new PathData();
      const innerCut = new PathData();
      const boundaryCut = new PathData();

      score.concatPath(this.nonTabbedAscendantScores);
      boundaryCut.concatPath(this.femaleAscendantFlap);
      // base edge tabs
      faceTabFenceposts.slice(0, -1).forEach((edgePt1, index) => {
        const edgePt2 = faceTabFenceposts[index + 1];
        const baseEdgeTab = baseEdgeConnectionTab(
          edgePt1, edgePt2, baseTabDepth, baseEdgeTabsSpec, baseScoreDashSpec,
        );
        boundaryCut.weldPath(baseEdgeTab.boundaryCut);
        innerCut.concatPath(baseEdgeTab.innerCut);
        score.concatPath(baseEdgeTab.score);
      });
      // male tabs
      boundaryCut.weldPath(this.ascendantEdgeTabs.male.cut, true);
      score.concatPath(this.ascendantEdgeTabs.male.score);

      // female inner
      innerCut.concatPath(this.ascendantEdgeTabs.female.cut);
      score.concatPath(this.ascendantEdgeTabs.female.score);
      const cut = (new PathData()).concatPath(innerCut).concatPath(boundaryCut);
      return { cut, score };
    },

    get decorationCutPath():PathData {
      if (!this.texturePathD) { return null; }
      const cut = new PathData();
      const insetDecorationPath = (new PathData(this.texturePathD))
        .transform(`${
          this.borderInsetFaceHoleTransformMatrix.toString()} ${
          this.pathScaleMatrix.toString()}`);
      for (const matrix of this.faceDecorationTransformMatricies) {
        const tiledDecorationPath = insetDecorationPath.clone().transform(matrix.toString());
        cut.concatPath(tiledDecorationPath);
      }
      return cut;
    },

    get borderInsetFaceHoleTransformMatrix(): DOMMatrixReadOnly {
      const scale = 1 / this.borderToInsetRatio;
      const insetPolygonPoints = offsetPolygonPoints(this.faceBoundaryPoints, -this.ascendantEdgeTabDepth);
      const { x: inX, y: inY } = insetPolygonPoints[0];
      return (new DOMMatrixReadOnly()).translate(inX, inY).scale(scale, scale);
    },

    get textureBorderWidth() {
      const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = self;
      return tabDepthToTraversalLength * FACE_FIRST_EDGE_NORMALIZED_SIZE * this.borderToInsetRatio;
    },

    get pathScaleMatrix(): DOMMatrixReadOnly {
      return (new DOMMatrixReadOnly()).scale(this.faceLengthAdjustRatio, this.faceLengthAdjustRatio);
    },
    get texturePathD() {
      if (!self.faceDecoration) { return null; }

      if (getType(self.faceDecoration) === TextureFaceDecorationModel) {
        const { pattern, transformMatrix } = self.faceDecoration as ITextureFaceDecorationModel;
        if (getType(pattern) === PathFaceDecorationPatternModel) {
          const { pathD, isPositive } = pattern as IPathFaceDecorationPatternModel;
          return getBoundedTexturePathD(
            closedPolygonPath(this.normalizedDecorationBoundaryPoints).getD(),
            pathD,
            transformMatrix.toString(),
            isPositive,
          );
        }
      } else if (getType(self.faceDecoration) === RawFaceDecorationModel) {
        const { dValue } = self.faceDecoration as IRawFaceDecorationModel;
        return dValue;
      }
      // invalid types caught by runtime mst type checking, for linting only
      return null;
    },
    get faceDecorationTransformMatricies(): DOMMatrixReadOnly[] {
      const matrices = [];

      for (let i = 0; i < self.pyramid.facesPerNet; i += 1) {
        const isMirrored = !!(i % 2) && !self.pyramid.faceIsSymmetrical;
        const xScale = isMirrored ? -1 : 1;
        const asymmetryNudge = isMirrored
          ? this.faceInteriorAngles[2] - 2 * ((Math.PI / 2) - this.faceInteriorAngles[0]) : 0;
        const baseTabRotationRad = -1 * i * this.faceInteriorAngles[2];
        const decorationRotationRad = xScale * baseTabRotationRad + asymmetryNudge;
        matrices.push((new DOMMatrixReadOnly())
          .scale(xScale, 1).rotate(radToDeg(decorationRotationRad)));
      }
      return matrices;
    },
  //  =========================================================
  }))
  .actions((self) => ({
    afterCreate() {
      this.applyShapeBasedDefaults();
    },
    setPyramidShapeName(name: string) {
      self.faceDecoration = undefined;
      self.pyramid.shapeName = name;
      // all geometries have 1 as option, but different shapes have different divisors > 1
      self.pyramid.netsPerPyramid = 1;
      this.applyShapeBasedDefaults();
    },
    applyShapeBasedDefaults() {
      // the taller the face triangle, the larger the holeBreadthToHalfWidth value
      const rangeTraversalRatio = (min, max, value) => (value - min) / (max - min);
      const interpolateBetween = (min, max, ratio) => (min + ratio * (max - min));
      const MAX_INVERSE_ASPECT = 2;
      const MIN_INVERSE_ASPECT = 0.5;
      const MIN_BREADTH = 0.3;
      const MAX_BREADTH = 0.6;
      const actualInverseAspect = self.faceBoundaryPoints[1].y / self.actualFaceEdgeLengths[1];
      const clampedInverseAspect = Math.min(Math.max(actualInverseAspect, MIN_INVERSE_ASPECT), MAX_INVERSE_ASPECT);
      const inverseAspectRatio = rangeTraversalRatio(MIN_INVERSE_ASPECT, MAX_INVERSE_ASPECT, clampedInverseAspect);
      self.baseEdgeTabsSpec.holeBreadthToHalfWidth = interpolateBetween(MIN_BREADTH, MAX_BREADTH, inverseAspectRatio);
      self.baseEdgeTabsSpec.finOffsetRatio = interpolateBetween(0, 0.8, 1 - inverseAspectRatio);
    },

    setRawFaceDecoration(d) {
      self.faceDecoration = RawFaceDecorationModel.create({ dValue: d });
    },

    setTextureFaceDecoration(snapshot) {
      self.faceDecoration = TextureFaceDecorationModel.create(snapshot);
    },

    setUseDottedStroke(useDotted) {
      self.useDottedStroke = useDotted;
      if (useDotted) {
        self.interFaceScoreDashSpec = DashPatternModel.create(defaultStrokeDashSpec);
        self.baseScoreDashSpec = DashPatternModel.create(defaultStrokeDashSpec);
      } else {
        self.interFaceScoreDashSpec = undefined;
        self.baseScoreDashSpec = undefined;
      }
    },

    setInterFaceScoreDashSpecPattern(id) {
      self.interFaceScoreDashSpec.strokeDashPathPattern = resolveIdentifier(
        StrokeDashPathPatternModel, getParent(self), id,
      );
    },

    setBaseScoreDashSpecPattern(id) {
      self.baseScoreDashSpec.strokeDashPathPattern = resolveIdentifier(
        StrokeDashPathPatternModel, getParent(self), id,
      );
    },
  }));

export interface IPyramidNetModel extends Instance<typeof PyramidNetModel> {}
