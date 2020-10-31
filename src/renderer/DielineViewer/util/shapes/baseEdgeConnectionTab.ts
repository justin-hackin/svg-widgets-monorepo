import { Instance, types } from 'mobx-state-tree';

import { PathData } from '../PathData';
import {
  distanceBetweenPoints,
  hingedPlot,
  hingedPlotByProjectionDistance,
  hingedPlotLerp,
  intersectLineLine,
  PointLike,
  VERY_LARGE_NUMBER,
} from '../../../common/util/geom';
import { IDashPatternModel, strokeDashPath } from './strokeDashPath';
import { connectedLineSegments } from './generic';
import { arrowTab } from './symmetricRoundedTab';

export interface BaseEdgeConnectionTab {
  score: PathData,
  cut: PathData,
}

// "base" is crease upon which tab it folds
// "edge" is opposite the base (most distant from it)
// "depth" is the distance from the base to the edge
// "fin" is the male part of the tab which enters the hole of the tab
// "handle" is the part of the tab that surrounds the hole of the tab
const defaultBendGuideValley = { depthRatio: 0.5, theta: Math.PI / 4 };

export const BaseEdgeTabsModel = types.model({
  finDepthToTabDepth: types.number,
  finOffsetRatio: types.number,
  holeBreadthToHalfWidth: types.number,
  holeDepthToTabDepth: types.number,
  holeTaper: types.number,
  tabDepthToAscendantTabDepth: types.number,
  bendGuideValley: types.maybe(types.model({
    depthRatio: types.number,
    theta: types.number,
  })),
}).actions((self) => ({
  unsetBendGuideValley() {
    self.bendGuideValley = undefined;
  },
  resetBendGuideValleyToDefault() {
    self.bendGuideValley = { ...defaultBendGuideValley };
  },
}));

export interface IBaseEdgeTabsModel extends Instance<typeof BaseEdgeTabsModel> {
}

export function baseEdgeConnectionTab(
  start: PointLike, end: PointLike,
  ascendantEdgeTabDepth, tabSpec: IBaseEdgeTabsModel, scoreDashSpec: IDashPatternModel,
): BaseEdgeConnectionTab {
  const {
    tabDepthToAscendantTabDepth,
    holeDepthToTabDepth,
    holeTaper,
    holeBreadthToHalfWidth,
    finDepthToTabDepth,
    finOffsetRatio,
    bendGuideValley,
  } = tabSpec;

  const tabDepth = tabDepthToAscendantTabDepth * ascendantEdgeTabDepth;
  const cutPath = new PathData();
  const mid = hingedPlotLerp(start, end, 0, 0.5);
  const holeHandleThicknessRatio = (1 - holeBreadthToHalfWidth) / 2;
  const offsetHoleHandle = finOffsetRatio * holeHandleThicknessRatio;

  const outLengthRatio = holeHandleThicknessRatio - offsetHoleHandle;
  const inLengthRatio = holeHandleThicknessRatio + offsetHoleHandle;
  const holeBases = [
    hingedPlotLerp(mid, start, 0, outLengthRatio),
    hingedPlotLerp(start, mid, 0, inLengthRatio),
  ];
  const holeTheta = -holeTaper + Math.PI / 2;
  const holeEdges = [
    hingedPlotByProjectionDistance(
      holeBases[1], holeBases[0], holeTheta, -tabDepth * holeDepthToTabDepth,
    ),
    hingedPlotByProjectionDistance(
      holeBases[0], holeBases[1], Math.PI / 2, tabDepth * holeDepthToTabDepth,
    ),
  ];

  const finBases = [
    hingedPlotLerp(end, mid, 0, inLengthRatio),
    hingedPlotLerp(mid, end, 0, outLengthRatio),
  ];

  const finDepth = finDepthToTabDepth * tabDepth;
  const finTraversal = distanceBetweenPoints(finBases[0], finBases[1]);
  // for plotting points only, need rounding clamp based on all roundings
  const { cutPath: finCutPath, scorePath: finScorePath } = arrowTab(
    finBases[0], finBases[1], 0.5,
    finDepth / finTraversal, holeTheta, scoreDashSpec,
  );

  const holePath = connectedLineSegments([holeBases[0], holeEdges[0], holeEdges[1], holeBases[1]]);
  cutPath.concatPath(holePath);
  cutPath.close();

  const handleEdges = [
    hingedPlotByProjectionDistance(finBases[0], start, holeTheta, -tabDepth),
    // TODO: should this go back to symmetric?
    hingedPlotByProjectionDistance(start, finBases[0], Math.PI * 0.6, tabDepth),
  ];
  const handleCornerPoints = [start, handleEdges[0]];

  if (bendGuideValley) {
    const { depthRatio: valleyDepthRatio, theta: valleyTheta } = bendGuideValley;
    const handleValleyDip = hingedPlot(end, mid, Math.PI / 2, valleyDepthRatio * tabDepth);
    const handleValleyEdgeCasters = [
      hingedPlot(mid, handleValleyDip, Math.PI + valleyTheta, VERY_LARGE_NUMBER),
      hingedPlot(mid, handleValleyDip, Math.PI - valleyTheta, VERY_LARGE_NUMBER),
    ];
    const handleValleyEdges = handleValleyEdgeCasters.map(
      (castPt) => intersectLineLine(handleEdges[0], handleEdges[1], handleValleyDip, castPt),
    );
    handleCornerPoints.push(handleValleyEdges[0], handleValleyDip, handleValleyEdges[1]);
  }
  handleCornerPoints.push(handleEdges[1], finBases[0]);
  // cutPath.concatPath(roundedEdgePath(handleCornerPoints, roundingDistance));
  cutPath.concatPath(connectedLineSegments(handleCornerPoints));
  cutPath.line(finBases[0]).concatPath(finCutPath.sliceCommandsDangerously(1));
  cutPath.line(finBases[1]);
  cutPath.line(end);
  const scorePath = new PathData();
  scorePath.concatPath(strokeDashPath(start, holeBases[0], scoreDashSpec));
  scorePath.concatPath(strokeDashPath(holeBases[1], finBases[0], scoreDashSpec));
  scorePath.concatPath(finScorePath);

  return { cut: cutPath, score: scorePath };
}
