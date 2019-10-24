/* eslint-disable newline-per-chained-call */
// Abstract codes are special commands that do not map to the SVG path spec command directly
// instead they may render one or more svg commands and infer their parameters from neighbouring points
import last from 'lodash-es/last';
import range from 'lodash-es/range';
import { COMMAND_FACTORY, PathData } from './path';
import {
  hingedPlot, hingedPlotByProjectionDistance, hingedPlotLerp,
  intersectLineLine,
  parallelLinePointsAtDistance,
  symmetricHingePlot,
  symmetricHingePlotByProjectionDistance,
} from './geom';

export const roundedEdgePath = (points, retractionDistance) => {
  const path = (new PathData()).move(points[0]);
  points.slice(1, -1).reduce((acc, point, pointIndex) => {
    const thisPoint = point.point || point;
    const thisRetractionDistance = point.retractionDistance || retractionDistance;

    const toward = points[pointIndex + 2];
    const fromPoint = points[pointIndex];
    const curveStart = hingedPlot(fromPoint, thisPoint, 0, thisRetractionDistance);
    const curveEnd = hingedPlot(toward, thisPoint, 0, thisRetractionDistance);
    acc.line(curveStart);
    acc.quadraticBezier(thisPoint, curveEnd);
    return acc;
  }, path);
  return path.line(last(points));
};
const moveLines = (points) => points.map((point, index) => COMMAND_FACTORY[index ? 'L' : 'M'](point));

export const ascendantEdgeConnectionTabs = (start, end, tabDepth, tabRoundingDistance,
  tabsCount = 3, midpointDepthToTabDepth = 0.6, tabStartGapToTabDepth = 0.5, holeReachToTabDepth = 0.1,
  holeWidthRatio = 0.4, holeFlapTaperAngle = Math.PI / 10, tabWideningAngle = Math.PI / 6) => {
  const vector = end.subtract(start);
  const edgeDistance = vector.length;
  const tabTileDistance = edgeDistance / tabsCount;
  const tabWidth = holeWidthRatio * tabTileDistance;
  const commands = {
    tabs: (new PathData()).move(start),
    holes: (new PathData()),
    scores: (new PathData()).move(start),
  };
  const ARBITRARY_LENGTH = 10;
  range(0, tabsCount).forEach((tabNum) => {
    const tabStartSpace = tabStartGapToTabDepth * tabDepth;
    const startHingeDistance = tabStartSpace + tabTileDistance * tabNum;
    const tabBaseStart = hingedPlot(end, start, 0, startHingeDistance);
    const tabBaseEnd = hingedPlot(end, start, 0, startHingeDistance + tabWidth);
    const [tabEdgeStart, tabEdgeEnd] = parallelLinePointsAtDistance(tabBaseStart, tabBaseEnd, tabDepth);
    const midpointDepth = tabDepth * midpointDepthToTabDepth;
    const [tabMidIntersectorStart, tabMidIntersectorEnd] = parallelLinePointsAtDistance(
      tabBaseStart, tabBaseEnd, midpointDepth,
    );
    const [tabStartDeparture, tabEndDeparture] = symmetricHingePlot(
      tabBaseStart, tabBaseEnd, Math.PI / 2 + tabWideningAngle, ARBITRARY_LENGTH,
    );
    const tabMidpointStart = intersectLineLine(
      tabMidIntersectorStart, tabMidIntersectorEnd, tabBaseStart, tabStartDeparture,
    );
    const tabMidpointEnd = intersectLineLine(
      tabMidIntersectorStart, tabMidIntersectorEnd, tabBaseEnd, tabEndDeparture,
    );

    const [holeEdgeStart, holeEdgeEnd] = symmetricHingePlotByProjectionDistance(
      tabBaseStart, tabBaseEnd, -Math.PI / 2 + holeFlapTaperAngle, holeReachToTabDepth * -tabDepth,
    );

    commands.tabs.line(tabBaseStart);
    const tabPath = roundedEdgePath(
      [tabBaseStart, tabMidpointStart, tabEdgeStart, tabEdgeEnd, tabMidpointEnd, tabBaseEnd], tabRoundingDistance,
    );
    tabPath.sliceCommandsDangerously(1);
    // roundedEdgePath assumes first point is move command but we needed and applied line
    commands.tabs.concatPath(tabPath);
    commands.holes.concatCommands(moveLines(
      [tabBaseStart, holeEdgeStart, holeEdgeEnd, tabBaseEnd],
    ));
    commands.scores.line(tabBaseStart);
    commands.scores.move(tabBaseEnd);
  });
  commands.tabs.line(end);
  commands.scores.line(end);

  return commands;
};

export function baseEdgeConnectionTab(start, end, tabDepth, roundingDistance, holeDepthToTabDepth = 0.5, holeTaper = Math.PI / 4, holeBreadthToHalfWidth = 0.5, finDepthToTabDepth = 0.7, finTipDepthToFinDepth = 1.1) {
  const cutPath = new PathData();
  const mid = hingedPlotLerp(start, end, 0, 0.5);

  const holeHandleThicknessRatio = (1 - holeBreadthToHalfWidth) / 2;
  const holeBases = [
    hingedPlotLerp(mid, start, 0, holeHandleThicknessRatio),
    hingedPlotLerp(start, mid, 0, holeHandleThicknessRatio),
  ];
  const holeTheta = -holeTaper + Math.PI / 2;
  const holeEdges = symmetricHingePlotByProjectionDistance(holeBases[0], holeBases[1], holeTheta, tabDepth * holeDepthToTabDepth);
  const roundedHole = roundedEdgePath([holeBases[0], holeEdges[0], holeEdges[1], holeBases[1]], roundingDistance);
  cutPath.concatPath(roundedHole);
  cutPath.close();

  const handleEdges = symmetricHingePlotByProjectionDistance(start, mid, holeTheta, tabDepth);
  cutPath.concatPath(roundedEdgePath([start, handleEdges[0], handleEdges[1], mid], roundingDistance));


  const finBases = [
    hingedPlotLerp(end, mid, 0, holeHandleThicknessRatio),
    hingedPlotLerp(mid, end, 0, holeHandleThicknessRatio),
  ];
  const finDepth = finDepthToTabDepth * tabDepth;
  const backFinEdge = hingedPlotByProjectionDistance(finBases[1], finBases[0], holeTheta, -finDepth);
  // const frontFinEdge = hingedPlotByProjectionDistance(finBases[0], finBases[1], Math.PI / 2, finDepth);
  const finMidTip = hingedPlotByProjectionDistance(
    finBases[0], finBases[1], holeTheta, finDepth * finTipDepthToFinDepth,
  );
  const finPath = roundedEdgePath([finBases[0], backFinEdge, finMidTip, finBases[1]], roundingDistance);
  cutPath.line(finBases[0]).concatPath(finPath.sliceCommandsDangerously(1));
  cutPath.line(finBases[1]);
  cutPath.line(end);
  const scorePath = new PathData();
  scorePath.move(start).line(holeBases[0]).move(holeBases[1]).line(mid).move(finBases[0]).line(finBases[1]);
  return { cut: cutPath, score: scorePath };
}
