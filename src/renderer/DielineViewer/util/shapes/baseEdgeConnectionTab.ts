import { Instance, types } from 'mobx-state-tree';

import { PathData } from '../PathData';
import {
  distanceBetweenPoints,
  hingedPlot,
  hingedPlotByProjectionDistance,
  hingedPlotLerp,
  getLineLineIntersection,
  RawPoint, symmetricHingePlotByProjectionDistance,
} from '../../../common/util/geom';
import { IDashPatternModel, strokeDashPath } from './strokeDashPath';
import { arrowTabPlots } from './symmetricRoundedTab';
import { VERY_LARGE_NUMBER } from '../../../common/constants';

export interface BaseEdgeConnectionTab {
  score: PathData,
  innerCut: PathData,
  boundaryCut: PathData,
}

// "base" is crease upon which tab it folds
// "edge" is opposite the base (most distant from it)
// "depth" is the distance from the base to the edge
// "fin" is the male part of the tab which enters the hole of the tab
// "handle" is the part of the tab that surrounds the hole of the tab
/*
TODO: use of qualifier *Ratio is inconsistent remove all instances,
 in order to qualify properties, use property metadata which accurately describes
 property relationships and displays as tooltip on controls
*/
const BendGuideValleyModel = types.model({
  depthRatio: types.optional(types.number, 0.9),
  theta: types.optional(types.number, Math.PI / 4),
});

export const BaseEdgeTabsModel = types.model({
  finDepthToTabDepth: types.optional(types.number, 1.1),
  finOffsetRatio: types.optional(types.number, 0.75),
  holeBreadthToHalfWidth: types.optional(types.number, 0.25),
  holeDepthToTabDepth: types.optional(types.number, 0.5),
  holeTaper: types.optional(types.number, 0.7),
  scoreTabMidline: types.optional(types.boolean, false),
  roundingDistanceRatio: types.optional(types.number, 0.1),
  tabDepthToAscendantTabDepth: types.optional(types.number, 1.5),
  holeTabClearance: types.optional(types.number, 0.05),
  bendGuideValley: types.maybe(BendGuideValleyModel),
}).actions((self) => ({
  unsetBendGuideValley() {
    self.bendGuideValley = undefined;
  },
  resetBendGuideValleyToDefault() {
    self.bendGuideValley = BendGuideValleyModel.create();
  },
}));

export interface IBaseEdgeTabsModel extends Instance<typeof BaseEdgeTabsModel> {
}

export function baseEdgeConnectionTab(
  start: RawPoint, end: RawPoint,
  tabDepth, tabSpec: IBaseEdgeTabsModel, scoreDashSpec: IDashPatternModel,
): BaseEdgeConnectionTab {
  const {
    holeDepthToTabDepth,
    holeTaper,
    holeBreadthToHalfWidth,
    finDepthToTabDepth,
    finOffsetRatio,
    bendGuideValley,
    scoreTabMidline,
    roundingDistanceRatio,
    holeTabClearance,
  } = tabSpec;

  const boundaryCut = new PathData();
  const innerCut = new PathData();
  const score = new PathData();

  const mid = hingedPlotLerp(start, end, 0, 0.5);
  const holeHandleThicknessRatio = (1 - holeBreadthToHalfWidth) / 2;
  const offsetHoleHandle = finOffsetRatio * holeHandleThicknessRatio;
  const halfTabLength = distanceBetweenPoints(start, end) / 2;

  const outLengthRatio = holeHandleThicknessRatio - offsetHoleHandle;
  const inLengthRatio = holeHandleThicknessRatio + offsetHoleHandle;
  const inLengthHole = (inLengthRatio * halfTabLength) - (holeTabClearance * tabDepth);

  const holeBases = [
    hingedPlotLerp(mid, start, 0, outLengthRatio),
    hingedPlot(start, mid, 0, inLengthHole),
  ];
  const holeTheta = -holeTaper + Math.PI / 2;
  const holeEdges = symmetricHingePlotByProjectionDistance(
    holeBases[0], holeBases[1], holeTheta, tabDepth * holeDepthToTabDepth,
  );

  const finBases = [
    hingedPlotLerp(end, mid, 0, inLengthRatio),
    hingedPlotLerp(mid, end, 0, outLengthRatio),
  ];

  const finDepth = finDepthToTabDepth * tabDepth;
  const finTraversal = distanceBetweenPoints(finBases[0], finBases[1]);
  // for plotting points only, need rounding clamp based on all roundings
  const { tabMidpoints, tabApexes } = arrowTabPlots(
    finBases[0], finBases[1], 0.5,
    finDepth / finTraversal, holeTheta,
  );

  innerCut
    .move(holeBases[0])
    .line(holeBases[1])
    .curvedLineSegments([holeEdges[1], holeEdges[0]], roundingDistanceRatio, true);

  const handleEdges = [
    hingedPlotByProjectionDistance(finBases[0], start, holeTheta, -tabDepth),
    // TODO: should this go back to symmetric?
    hingedPlotByProjectionDistance(start, finBases[0], Math.PI * 0.6, tabDepth),
  ];
  const handleCornerPoints = [handleEdges[0]];

  if (bendGuideValley) {
    const { depthRatio: valleyDepthRatio, theta: valleyTheta } = bendGuideValley;
    const handleValleyDip = hingedPlot(end, mid, Math.PI / 2, valleyDepthRatio * tabDepth);
    const handleValleyEdgeCasters = [
      hingedPlot(mid, handleValleyDip, Math.PI + valleyTheta, VERY_LARGE_NUMBER),
      hingedPlot(mid, handleValleyDip, Math.PI - valleyTheta, VERY_LARGE_NUMBER),
    ];
    const handleValleyEdges = handleValleyEdgeCasters.map(
      (castPt) => getLineLineIntersection(handleEdges[0], handleEdges[1], handleValleyDip, castPt),
    );
    handleCornerPoints.push(handleValleyEdges[0], handleValleyDip, handleValleyEdges[1]);
  }
  handleCornerPoints.push(handleEdges[1], finBases[0]);
  boundaryCut.move(start).curvedLineSegments(handleCornerPoints, roundingDistanceRatio)
    .curvedLineSegments(
      [tabMidpoints[0], tabApexes[0], tabApexes[1], tabMidpoints[1], finBases[1]], roundingDistanceRatio,
    )
    .line(end);

  score.concatPath(strokeDashPath(finBases[0], finBases[1], scoreDashSpec));
  if (scoreTabMidline) {
    // TODO: this score doesn't meet with rounded tab edges, use bezier formula to find match
    score.concatPath(strokeDashPath(tabMidpoints[0], tabMidpoints[1], scoreDashSpec));
  }
  score.concatPath(strokeDashPath(start, holeBases[0], scoreDashSpec));
  score.concatPath(strokeDashPath(holeBases[1], finBases[0], scoreDashSpec));

  return { innerCut, boundaryCut, score };
}
