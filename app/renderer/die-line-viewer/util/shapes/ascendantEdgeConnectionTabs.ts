import range from 'lodash-es/range';
// @ts-ignore
import { Point } from '@flatten-js/core';
import last from 'lodash-es/last';
import { PathData } from '../PathData';
import {
  intersectLineLine,
  lineLerp,
  parallelLinePointsAtDistance,
  PointLike,
  symmetricHingePlot,
  symmetricHingePlotByProjectionDistance,
} from '../geom';
import { strokeDashPathRatios, StrokeDashPathSpec } from './strokeDashPath';
import { subtractRangeSet } from '../../data/range';
import { roundedEdgePath, connectedLineSegments } from './generic';

export const ascendantEdgeConnectionTabs = (
  start: PointLike, end: PointLike,
  tabSpec: AscendantEdgeTabsSpec, scoreDashSpec: StrokeDashPathSpec, tabIntervalRatios, tabGapIntervalRatios,
): AscendantEdgeConnectionPaths => {
  const {
    tabDepthToTraversalLength,
    tabRoundingDistanceRatio,
    tabsCount,
    midpointDepthToTabDepth,
    holeReachToTabDepth,
    holeFlapTaperAngle,
    tabWideningAngle,
  } = tabSpec;
  const vector = end.subtract(start);
  const tabDepth = tabDepthToTraversalLength * vector.length;
  const maleScoreLineIntervals = [];
  const commands = {
    female: {
      cut: (new PathData()),
      score: (new PathData()),
    },
    male: {
      cut: (new PathData()).move(start),
      score: (new PathData()),
    },
  };
  const ARBITRARY_LENGTH = 10;
  range(0, tabsCount).forEach((tabNum) => {
    const tabBaseStart = lineLerp(start, end, tabIntervalRatios[tabNum][0]);
    const tabBaseEnd = lineLerp(start, end, tabIntervalRatios[tabNum][1]);
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
    // don't let the retraction happen any more than half the length of shortest the non-rounded edge
    // otherwise the control points may criss-cross causing odd loops
    const tabRoundingDistance = tabRoundingDistanceRatio * 0.5 * Math.min(
      tabBaseStart.subtract(tabMidpointStart).length,
      tabMidpointStart.subtract(tabEdgeStart).length,
    );
    commands.male.cut.line(tabBaseStart);
    const tabPath = roundedEdgePath(
      [tabBaseStart, tabMidpointStart, tabEdgeStart, tabEdgeEnd, tabMidpointEnd, tabBaseEnd], tabRoundingDistance,
    );
    maleScoreLineIntervals.push([new Point(...tabPath.commands[0].to), new Point(...last(tabPath.commands).to)]);
    tabPath.sliceCommandsDangerously(1);
    // roundedEdgePath assumes first point is move command but we needed and applied line
    commands.male.cut.concatPath(tabPath);
    commands.female.cut.concatPath(connectedLineSegments(
      [tabBaseStart, holeEdgeStart, holeEdgeEnd, tabBaseEnd],
    ));
  });

  commands.male.cut.line(end);
  const dashRatios = strokeDashPathRatios(start, end, scoreDashSpec);
  const tabDashRatios = subtractRangeSet(dashRatios, tabIntervalRatios);
  const tabGapDashRatios = subtractRangeSet(dashRatios, tabGapIntervalRatios);

  for (const [femaleStart, femaleEnd] of tabDashRatios) {
    commands.female.score.move(lineLerp(start, end, femaleStart)).line(lineLerp(start, end, femaleEnd));
  }
  for (const [maleStart, maleEnd] of tabGapDashRatios) {
    commands.male.score.move(lineLerp(start, end, maleStart)).line(lineLerp(start, end, maleEnd));
  }
  return commands;
};

export interface AscendantEdgeTabsSpec {
  tabDepthToTraversalLength: number,
  tabRoundingDistanceRatio: number,
  flapRoundingDistanceRatio: number,
  tabsCount: number,
  midpointDepthToTabDepth: number,
  tabStartGapToTabDepth: number,
  holeReachToTabDepth: number,
  holeWidthRatio: number,
  holeFlapTaperAngle: number,
  tabWideningAngle: number,
}

interface AscendantEdgeConnectionPaths {
  female: {
    cut: PathData,
    score: PathData,
  }
  male: {
    cut: PathData,
    score: PathData,
  }
}
