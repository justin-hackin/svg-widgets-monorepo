import { PathData } from '../PathData';
import {
  distanceBetweenPoints,
  hingedPlotByProjectionDistance,
  hingedPlotLerp,
  PointLike,
  symmetricHingePlotByProjectionDistance,
} from '../geom';
import { strokeDashPath, StrokeDashPathSpec } from './strokeDashPath';
import { roundedEdgePath } from './generic';

export interface BaseEdgeConnectionTabSpec {
  tabDepthToAscendantEdgeLength: number,
  roundingDistanceRatio: number,
  holeDepthToTabDepth: number,
  holeTaper: number,
  holeBreadthToHalfWidth: number,
  finDepthToTabDepth: number,
  finOffsetRatio: number,
}

export interface BaseEdgeConnectionTab {
  score: PathData,
  cut: PathData,
}

export function baseEdgeConnectionTab(
  start: PointLike, end: PointLike,
  ascendantEdgeTabDepth, tabSpec: BaseEdgeConnectionTabSpec, scoreDashSpec: StrokeDashPathSpec,
): BaseEdgeConnectionTab {
  const {
    tabDepthToAscendantEdgeLength,
    roundingDistanceRatio,
    holeDepthToTabDepth,
    holeTaper,
    holeBreadthToHalfWidth,
    finDepthToTabDepth,
    finOffsetRatio,
  } = tabSpec;
  const tabDepth = tabDepthToAscendantEdgeLength * ascendantEdgeTabDepth;
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
  const holeEdges = symmetricHingePlotByProjectionDistance(
    holeBases[0], holeBases[1], holeTheta, tabDepth * holeDepthToTabDepth,
  );

  const finBases = [
    hingedPlotLerp(end, mid, 0, inLengthRatio),
    hingedPlotLerp(mid, end, 0, outLengthRatio),
  ];

  const handleEdges = symmetricHingePlotByProjectionDistance(start, finBases[0], holeTheta, tabDepth);
  const finDepth = finDepthToTabDepth * tabDepth;
  const backFinEdge = hingedPlotByProjectionDistance(finBases[1], finBases[0], holeTheta, -finDepth);
  // const frontFinEdge = hingedPlotByProjectionDistance(finBases[0], finBases[1], Math.PI / 2, finDepth);
  const finMidTip = hingedPlotByProjectionDistance(finBases[0], finBases[1], holeTheta, finDepth);

  const roundingEdgeLengths: number[] = [
    [holeBases[0], holeEdges[0]],
    [holeEdges[0], holeEdges[1]],
    //  handle edges are always longer than hole edges
    [finBases[0], backFinEdge],
    [backFinEdge, finMidTip],
  ].map(([pt1, pt2]) => distanceBetweenPoints(pt1, pt2));
  const roundingDistance = roundingDistanceRatio * Math.min(...roundingEdgeLengths);
  const roundedHole = roundedEdgePath([holeBases[0], holeEdges[0], holeEdges[1], holeBases[1]], roundingDistance);
  cutPath.concatPath(roundedHole);
  cutPath.close();

  cutPath.concatPath(roundedEdgePath([start, handleEdges[0], handleEdges[1], finBases[0]], roundingDistance));

  const finPath = roundedEdgePath([finBases[0], backFinEdge, finMidTip, finBases[1]], roundingDistance);
  cutPath.line(finBases[0]).concatPath(finPath.sliceCommandsDangerously(1));
  cutPath.line(finBases[1]);
  cutPath.line(end);
  const scorePath = new PathData();
  scorePath.concatPath(strokeDashPath(start, holeBases[0], scoreDashSpec));
  scorePath.concatPath(strokeDashPath(holeBases[1], finBases[1], scoreDashSpec));
  return { cut: cutPath, score: scorePath };
}
