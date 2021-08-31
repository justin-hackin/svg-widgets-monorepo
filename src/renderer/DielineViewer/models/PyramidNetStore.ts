/* eslint-disable no-param-reassign */
import { chunk, flatten, range } from 'lodash';
import {
  getParent,
  model, Model, modelAction, prop, resolveId, undoMiddleware,
} from 'mobx-keystone';
import {computed, observable} from 'mobx';

import {
  hingedPlot,
  hingedPlotByProjectionDistance,
  offsetPolygonPoints,
  polygonPointsGivenAnglesAndSides,
  RawPoint,
  scalePoint,
  sumPoints,
  triangleAnglesGivenSides,
} from '../../../common/util/geom';
import { closedPolygonPath, roundedEdgePath } from '../util/shapes/generic';
import {
  AscendantEdgeConnectionPaths,
  ascendantEdgeConnectionTabs,
  AscendantEdgeTabsModel,
} from '../util/shapes/ascendantEdgeConnectionTabs';
import { baseEdgeConnectionTab, BaseEdgeTabsModel } from '../util/shapes/baseEdgeConnectionTab';
import { DashPatternModel, strokeDashPath } from '../util/shapes/strokeDashPath';
import { getBoundingBoxAttrs } from '../../../common/util/svg';
import { getBoundedTexturePathD } from '../../../common/util/path-boolean';
import { PathData } from '../util/PathData';
import { degToRad, PIXELS_PER_CM, radToDeg } from '../../../common/util/units';
import {
  PathFaceDecorationPatternModel,
} from '../../../common/models/PathFaceDecorationPatternModel';
import { TextureFaceDecorationModel } from './TextureFaceDecorationModel';
import { RawFaceDecorationModel } from './RawFaceDecorationModel';
import { PyramidModel } from './PyramidModel';

export const FACE_FIRST_EDGE_NORMALIZED_SIZE = 2000;

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

@model('PyramidNetModel')
export class PyramidNetModel extends Model({
  pyramid: prop<PyramidModel>(() => (new PyramidModel({}))),
  ascendantEdgeTabsSpec: prop<AscendantEdgeTabsModel>(() => (new AscendantEdgeTabsModel({}))),
  baseEdgeTabsSpec: prop<BaseEdgeTabsModel>(() => (new BaseEdgeTabsModel({}))),
  shapeHeight: prop(20 * PIXELS_PER_CM),
  faceDecoration: prop<TextureFaceDecorationModel | RawFaceDecorationModel | null>(),
  useDottedStroke: prop(false),
  baseScoreDashSpec: prop<DashPatternModel | null>(null),
  interFaceScoreDashSpec: prop<DashPatternModel | null>(null),
}) {
  @observable
  history = undoMiddleware(this);

  testTabHandleFlapDepth = 2;

  testTabHandleFlapRounding = 0.5;

  get tabIntervalRatios() {
    const {
      tabsCount, tabStartGapToTabDepth, tabDepthToTraversalLength, holeWidthRatio,
    } = this.ascendantEdgeTabsSpec;
    const offsetRatio = tabDepthToTraversalLength * tabStartGapToTabDepth;
    const intervalRatio = (1 - offsetRatio) / tabsCount;
    const tabWidthRatio = intervalRatio * holeWidthRatio;
    return range(tabsCount)
      .map((index) => [
        offsetRatio + index * intervalRatio,
        offsetRatio + index * intervalRatio + tabWidthRatio,
      ]);
  }

  @computed
  get relativeFaceEdgeLengths() {
    if (this.pyramid.geometry.uniqueFaceEdgeLengths.length === 3) {
      return this.pyramid.geometry.uniqueFaceEdgeLengths;
    }
    const firstLength = this.pyramid.geometry.uniqueFaceEdgeLengths[0];
    if (this.pyramid.geometry.uniqueFaceEdgeLengths.length === 2) {
      return [...this.pyramid.geometry.uniqueFaceEdgeLengths, firstLength];
    }
    return [firstLength, firstLength, firstLength];
  }

  @computed
  get tabGapIntervalRatios() {
    return chunk([0, ...flatten(this.tabIntervalRatios), 1], 2);
  }

  @computed
  get faceEdgeNormalizer() {
    return FACE_FIRST_EDGE_NORMALIZED_SIZE / this.relativeFaceEdgeLengths[0];
  }

  @computed
  get normalizedFaceEdgeLengths() {
    return this.relativeFaceEdgeLengths.map(
      // @ts-ignore
      (val) => val * this.faceEdgeNormalizer,
    );
  }

  @computed
  get faceInteriorAngles(): number[] {
    return triangleAnglesGivenSides(this.normalizedFaceEdgeLengths);
  }

  @computed
  get faceBoundaryPoints() {
    return polygonPointsGivenAnglesAndSides(this.faceInteriorAngles, this.actualFaceEdgeLengths);
  }

  @computed
  get normalizedDecorationBoundaryPoints():RawPoint[] {
    return polygonPointsGivenAnglesAndSides(
      this.faceInteriorAngles,
      this.normalizedFaceEdgeLengths,
    );
  }

  // factor to scale face lengths such that the first edge will be equal to 1
  @computed
  get faceLengthAdjustRatio() {
    const { shapeHeight } = this;
    const { diameter } = this.pyramid.geometry;
    const firstSideLengthInPx = ((shapeHeight * this.relativeFaceEdgeLengths[0]) / diameter);
    return firstSideLengthInPx / FACE_FIRST_EDGE_NORMALIZED_SIZE;
  }

  @computed
  get actualFaceEdgeLengths() {
    return this.normalizedFaceEdgeLengths.map((len) => len * this.faceLengthAdjustRatio);
  }

  @computed
  get ascendantEdgeTabDepth() {
    const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = this;
    return this.traversalLength * tabDepthToTraversalLength * 0.6;
  }

  @computed
  get borderToInsetRatio() {
    const insetPolygonPoints = offsetPolygonPoints(this.faceBoundaryPoints, -this.ascendantEdgeTabDepth);
    return getBoundingBoxAttrs(closedPolygonPath(this.faceBoundaryPoints).getD()).width
      / getBoundingBoxAttrs(closedPolygonPath(insetPolygonPoints).getD()).width;
  }

  @computed
  get insetToBorderOffset() {
    const normalizedInsetPoints = offsetPolygonPoints(
      this.normalizedDecorationBoundaryPoints,
      -this.ascendantEdgeTabDepth / this.faceLengthAdjustRatio,
    );
    return scalePoint(normalizedInsetPoints[0], -this.borderToInsetRatio);
  }

  @computed
  get faceTabFenceposts() {
    const { pyramid: { facesPerNet } } = this;
    const { faceBoundaryPoints, faceInteriorAngles, actualFaceEdgeLengths } = this;
    return range(facesPerNet + 1).map(
      (index) => hingedPlot(
        faceBoundaryPoints[1], faceBoundaryPoints[0], Math.PI * 2 - index * faceInteriorAngles[2],
        index % 2 ? actualFaceEdgeLengths[2] : actualFaceEdgeLengths[0],
      ),
    );
  }

  @computed
  get baseTabDepth() {
    return this.baseEdgeTabsSpec.tabDepthToAscendantTabDepth * this.ascendantEdgeTabDepth;
  }

  @computed
  get masterBaseTab() {
    return baseEdgeConnectionTab(
      this.faceBoundaryPoints[1], this.faceBoundaryPoints[2],
      this.baseTabDepth, this.baseEdgeTabsSpec, this.baseScoreDashSpec,
    );
  }

  @computed
  get masterBaseTabCut() {
    return (new PathData()).concatPath(this.masterBaseTab.innerCut).concatPath(this.masterBaseTab.boundaryCut);
  }

  @computed
  get masterBaseTabScore() {
    return this.masterBaseTab.score;
  }

  @computed
  get testBaseTab() {
    const endPt = { x: this.actualFaceEdgeLengths[1], y: 0 };
    const { boundaryCut, innerCut, score } = baseEdgeConnectionTab(
      this.faceBoundaryPoints[0], endPt,
      this.baseTabDepth, this.baseEdgeTabsSpec, this.baseScoreDashSpec,
    );
    const cut = (new PathData()).concatPath(innerCut).concatPath(boundaryCut);
    applyFlap(cut, false,
      this.testTabHandleFlapDepth * this.baseTabDepth, this.testTabHandleFlapRounding);
    return { cut, score };
  }

  // length of first 2 face edges
  @computed
  get traversalLength() {
    return this.actualFaceEdgeLengths[0] + this.actualFaceEdgeLengths[1];
  }

  @computed
  get testAscendantTab(): AscendantEdgeConnectionPaths {
    const startPt = this.faceBoundaryPoints[0];
    const endPt = { x: this.actualFaceEdgeLengths[0], y: 0 };

    const { male, female } = ascendantEdgeConnectionTabs(
      startPt, endPt,
      this.ascendantEdgeTabsSpec, this.interFaceScoreDashSpec,
      this.tabIntervalRatios, this.tabGapIntervalRatios,
      this.ascendantEdgeTabDepth,
    );
    female.cut
      .concatPath(this.testTabFemaleAscendantFlap);

    applyFlap(male.cut, false,
      this.testTabHandleFlapDepth * this.baseTabDepth, this.testTabHandleFlapRounding);
    applyFlap(female.cut, true,
      this.testTabHandleFlapDepth * this.baseTabDepth, this.testTabHandleFlapRounding);
    return { male, female };
  }

  computeFemaleAscendantFlap(start, end) {
    // female tab outer flap
    const remainderGapAngle = 2 * Math.PI - this.faceInteriorAngles[2] * this.pyramid.geometry.faceCount;
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
      this.ascendantEdgeTabsSpec.flapRoundingDistanceRatio,
    );
  }

  @computed
  get femaleAscendantFlap() {
    return this.computeFemaleAscendantFlap(this.faceBoundaryPoints[0], this.faceBoundaryPoints[1]);
  }

  @computed
  get testTabFemaleAscendantFlap() {
    return this.computeFemaleAscendantFlap({ x: this.actualFaceEdgeLengths[0], y: 0 }, this.faceBoundaryPoints[0]);
  }

  @computed
  get nonTabbedAscendantScores() {
    // inter-face scoring
    return this.faceTabFenceposts.slice(1, -1).reduce((path, endPt) => {
      const pathData = strokeDashPath(this.faceBoundaryPoints[0], endPt, this.interFaceScoreDashSpec);
      return path.concatPath(pathData);
    }, (new PathData()));
  }

  @computed
  get ascendantEdgeTabs() {
    const ascendantTabs = ascendantEdgeConnectionTabs(
      this.faceBoundaryPoints[1], this.faceBoundaryPoints[0],
      this.ascendantEdgeTabsSpec, this.interFaceScoreDashSpec, this.tabIntervalRatios, this.tabGapIntervalRatios,
      this.ascendantEdgeTabDepth,
    );
    const rotationMatrix = `rotate(${radToDeg(-this.pyramid.facesPerNet * this.faceInteriorAngles[2])})`;
    ascendantTabs.male.cut.transform(rotationMatrix);
    ascendantTabs.male.score.transform(rotationMatrix);
    return ascendantTabs;
  }

  @computed
  get netPaths() {
    const { baseScoreDashSpec, baseEdgeTabsSpec } = this;
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
  }

  @computed
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
  }

  @computed
  get borderInsetFaceHoleTransformMatrix(): DOMMatrixReadOnly {
    const scale = 1 / this.borderToInsetRatio;
    const insetPolygonPoints = offsetPolygonPoints(this.faceBoundaryPoints, -this.ascendantEdgeTabDepth);
    const { x: inX, y: inY } = insetPolygonPoints[0];
    return (new DOMMatrixReadOnly()).translate(inX, inY).scale(scale, scale);
  }

  @computed
  get textureBorderWidth() {
    const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = this;
    return tabDepthToTraversalLength * FACE_FIRST_EDGE_NORMALIZED_SIZE * this.borderToInsetRatio;
  }

  @computed
  get pathScaleMatrix(): DOMMatrixReadOnly {
    return (new DOMMatrixReadOnly()).scale(this.faceLengthAdjustRatio, this.faceLengthAdjustRatio);
  }

  @computed
  get texturePathD() {
    if (!this.faceDecoration) { return null; }

    if (this.faceDecoration instanceof TextureFaceDecorationModel) {
      const { pattern, transform: { transformMatrix } } = this.faceDecoration as TextureFaceDecorationModel;
      if (pattern instanceof PathFaceDecorationPatternModel) {
        const { pathD, isPositive } = pattern as PathFaceDecorationPatternModel;
        return getBoundedTexturePathD(
          closedPolygonPath(this.normalizedDecorationBoundaryPoints).getD(),
          pathD,
          transformMatrix.toString(),
          isPositive,
        );
      }
    } else if (this.faceDecoration instanceof RawFaceDecorationModel) {
      return this.faceDecoration.dValue;
    }
    // invalid types caught by runtime mst type checking, for linting only
    return null;
  }

  @computed
  get faceDecorationTransformMatricies(): DOMMatrixReadOnly[] {
    const matrices = [];

    for (let i = 0; i < this.pyramid.facesPerNet; i += 1) {
      const isMirrored = !!(i % 2) && !this.pyramid.faceIsSymmetrical;
      const xScale = isMirrored ? -1 : 1;
      const asymmetryNudge = isMirrored
        ? this.faceInteriorAngles[2] - 2 * ((Math.PI / 2) - this.faceInteriorAngles[0]) : 0;
      const baseTabRotationRad = -1 * i * this.faceInteriorAngles[2];
      const decorationRotationRad = xScale * baseTabRotationRad + asymmetryNudge;
      matrices.push((new DOMMatrixReadOnly())
        .scale(xScale, 1).rotate(radToDeg(decorationRotationRad)));
    }
    return matrices;
  }

  onAttachedToRootStore(rootStore) {
    super.onAttachedToRootStore(rootStore);
    this.applyShapeBasedDefaults();
  }

  @modelAction
  setPyramidShapeName(name: string) {
    this.faceDecoration = undefined;
    this.pyramid.shapeName = name;
    // all geometries have 1 as option, but different shapes have different divisors > 1
    this.pyramid.netsPerPyramid = 1;
    this.applyShapeBasedDefaults();
  }

  @modelAction
  applyShapeBasedDefaults() {
    // the taller the face triangle, the larger the holeBreadthToHalfWidth value
    const rangeTraversalRatio = (min, max, value) => (value - min) / (max - min);
    const interpolateBetween = (min, max, ratio) => (min + ratio * (max - min));
    const MAX_INVERSE_ASPECT = 2;
    const MIN_INVERSE_ASPECT = 0.5;
    const MIN_BREADTH = 0.3;
    const MAX_BREADTH = 0.6;
    const actualInverseAspect = this.faceBoundaryPoints[1].y / this.actualFaceEdgeLengths[1];
    const clampedInverseAspect = Math.min(Math.max(actualInverseAspect, MIN_INVERSE_ASPECT), MAX_INVERSE_ASPECT);
    const inverseAspectRatio = rangeTraversalRatio(MIN_INVERSE_ASPECT, MAX_INVERSE_ASPECT, clampedInverseAspect);
    this.baseEdgeTabsSpec.holeBreadthToHalfWidth = interpolateBetween(MIN_BREADTH, MAX_BREADTH, inverseAspectRatio);
    this.baseEdgeTabsSpec.finOffsetRatio = interpolateBetween(0, 0.8, 1 - inverseAspectRatio);
  }

  @modelAction
  setRawFaceDecoration(d) {
    this.faceDecoration = new RawFaceDecorationModel({ dValue: d });
  }

  @modelAction
  setTextureFaceDecoration(snapshot) {
    this.faceDecoration = new TextureFaceDecorationModel(snapshot);
  }

  @modelAction
  setUseDottedStroke(useDotted) {
    this.useDottedStroke = useDotted;
    if (useDotted) {
      this.interFaceScoreDashSpec = new DashPatternModel({});
      this.baseScoreDashSpec = new DashPatternModel({});
    } else {
      this.interFaceScoreDashSpec = undefined;
      this.baseScoreDashSpec = undefined;
    }
  }

  @modelAction
  setInterFaceScoreDashSpecPattern(id) {
    this.interFaceScoreDashSpec.strokeDashPathPattern = resolveId(
      getParent(this), id,
    );
  }

  @modelAction
  setBaseScoreDashSpecPattern(id) {
    this.baseScoreDashSpec.strokeDashPathPattern = resolveId(
      getParent(this), id,
    );
  }
}
