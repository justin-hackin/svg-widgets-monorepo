/* eslint-disable newline-per-chained-call */
import last from 'lodash-es/last';
import range from 'lodash-es/range';
import sum from 'lodash-es/sum';
// @ts-ignore
import { Point } from '@flatten-js/core';
import { COMMAND_FACTORY, PathData } from './PathData';
import {
  PointLike,
  hingedPlot, hingedPlotByProjectionDistance, hingedPlotLerp,
  intersectLineLine, lineLerp,
  parallelLinePointsAtDistance,
  symmetricHingePlot,
  symmetricHingePlotByProjectionDistance, distanceBetweenPoints,
} from './geom';
import { subtractRangeSet } from '../data/range';

interface RoundPoint {
  point: PointLike,
  retractionDistance: number
}
// TODO: appears this is incoorect
type RoundPointPointsItem = PointLike | RoundPoint;

// a bit hacky but apparently required
// https://github.com/alexbol99/flatten-js/issues/14
export const roundedEdgePath = (points:RoundPointPointsItem[], retractionDistance:number):PathData => {
  const path = (new PathData()).move(points[0]);
  points.slice(1, -1).reduce((acc, point, pointIndex) => {
    const thisPoint = (point.point || point as PointLike);
    const thisRetractionDistance = point.retractionDistance || retractionDistance;
    const toward = (points[pointIndex + 2].point || points[pointIndex + 2] as PointLike);
    const fromPoint = (points[pointIndex].point || points[pointIndex] as PointLike);
    const curveStart = hingedPlot(fromPoint, thisPoint, 0, thisRetractionDistance);
    const curveEnd = hingedPlot(toward, thisPoint, 0, thisRetractionDistance);
    acc.line(curveStart);
    acc.quadraticBezier(thisPoint, curveEnd);
    return acc;
  }, path);
  return path.line(last(points));
};
const moveLines = (points) => points.map((point, index) => COMMAND_FACTORY[index ? 'L' : 'M'](point));

const wrapRatio = (number) => (number > 1 ? number - Math.floor(number) : number);

export function lineSeries(startEndArray) {
  const path = new PathData();
  startEndArray.forEach(([start, end]) => {
    path.move(start).line(end);
  });
  return path;
}
interface StrokeDashPathPatternSpec {
  relativeStrokeDasharray: number[],
  label: string,
}

export interface StrokeDashPathSpec {
  strokeDashPathPatternId: string,
  strokeDashPathPattern?:StrokeDashPathPatternSpec,
  strokeDashLength: number,
  strokeDashOffsetRatio: number,
}


function strokeDashPathRatios(
  start: PointLike, end: PointLike, dashSpec:StrokeDashPathSpec,
) {
  const {
    strokeDashPathPattern:{relativeStrokeDasharray},
    strokeDashLength,
    strokeDashOffsetRatio,
  } = dashSpec;
  const vector = end.subtract(start);
  const vectorLength = vector.length;
  const strokeDashLengthToVectorLength = strokeDashLength / vectorLength;
  if (strokeDashLengthToVectorLength > 1) {
    throw new Error('strokeDashLength is greater than length from start to end');
  }


  const dashArrayTotalLength = sum(relativeStrokeDasharray);
  const startEndLerps = relativeStrokeDasharray.reduce((acc, intervalLength, index) => {
    const intervalRatio = intervalLength / dashArrayTotalLength;
    const isStroke = index % 2 === 0;
    if (isStroke) {
      acc.lerps.push([acc.at, acc.at + intervalRatio]);
      acc.at += intervalRatio;
    } else {
      acc.at += intervalRatio;
    }
    return acc;
  }, { at: 0, lerps: [] }).lerps;

  const iterationsRequiredForCoverage = Math.ceil(vectorLength / strokeDashLength);
  return range(iterationsRequiredForCoverage)
  // compute the start-end lerps relative to the start - end vector
    .reduce((acc, iterIndex) => {
      const lerpOffset = iterIndex * strokeDashLengthToVectorLength;
      const lerpTransform = (lerp) => lerp * strokeDashLengthToVectorLength + lerpOffset;
      return acc.concat(startEndLerps.map((el) => el.map(lerpTransform)));
    }, [])
  // remove line segments that lie fully outside the start-end vector
    .filter(([startLerp, endLerp]) => startLerp <= 1 && endLerp <= 1)
  // nudge the segments forward based on strokeDashOffsetRatio, wrapping and/or splicing where necessary
    .reduce((acc, startEndLerp) => {
      const startEndLerpNew = startEndLerp.map((val) => val + strokeDashOffsetRatio * strokeDashLengthToVectorLength);
      // the whole segment is past the edges of the vector, wrap whole thing
      if (startEndLerpNew[0] >= 1) {
        acc.push(startEndLerpNew.map(wrapRatio));
        return acc;
      }
      // start lies within but end lies without, chop at end, and wrap remainder
      if (startEndLerpNew[1] > 1) {
        acc.push([startEndLerpNew[0], 1]);
        acc.push([0, wrapRatio(startEndLerpNew[1])]);
        return acc;
      }
      acc.push(startEndLerpNew);
      return acc;
    }, [])
  // visually this should not make difference but better for plotters that don't optimize
    .sort(([start1], [start2]) => (start1 - start2));
}

export function strokeDashPath(
  start: PointLike, end: PointLike, dashSpec:StrokeDashPathSpec,
) {
  return lineSeries(strokeDashPathRatios(start, end, dashSpec)
    .map((startEndLerp) => startEndLerp.map((lerp) => lineLerp(start, end, lerp))));
}

export const ascendantEdgeConnectionTabs = (
  start: PointLike, end: PointLike,
  tabSpec: AscendantEdgeTabsSpec, scoreDashSpec: StrokeDashPathSpec, tabIntervalRatios, tabGapIntervalRatios,
):AscendantEdgeConnectionPaths => {
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
  const femaleScoreLineIntervals = [[start]];
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
    commands.female.cut.concatCommands(moveLines(
      [tabBaseStart, holeEdgeStart, holeEdgeEnd, tabBaseEnd],
    ));
    last(femaleScoreLineIntervals).push(tabBaseStart);
    femaleScoreLineIntervals.push([tabBaseEnd]);
  });

  commands.male.cut.line(end);
  last(femaleScoreLineIntervals).push(end);
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

export interface BaseEdgeConnectionTabSpec {
  tabDepthToAscendantEdgeLength:number,
  roundingDistanceRatio: number,
  holeDepthToTabDepth : number,
  holeTaper : number,
  holeBreadthToHalfWidth : number,
  finDepthToTabDepth : number,
  finTipDepthToFinDepth : number,
}

export interface BaseEdgeConnectionTab {
  score: PathData,
  cut: PathData,
}

export function baseEdgeConnectionTab(
  start: PointLike, end: PointLike,
  ascendantEdgeTabDepth, tabSpec: BaseEdgeConnectionTabSpec, scoreDashSpec: StrokeDashPathSpec,
):BaseEdgeConnectionTab {
  const {
    tabDepthToAscendantEdgeLength,
    roundingDistanceRatio,
    holeDepthToTabDepth,
    holeTaper,
    holeBreadthToHalfWidth,
    finDepthToTabDepth,
    finTipDepthToFinDepth,
  } = tabSpec;
  const tabDepth = tabDepthToAscendantEdgeLength * ascendantEdgeTabDepth;
  const cutPath = new PathData();
  const mid = hingedPlotLerp(start, end, 0, 0.5);

  const holeHandleThicknessRatio = (1 - holeBreadthToHalfWidth) / 2;
  const holeBases = [
    hingedPlotLerp(mid, start, 0, holeHandleThicknessRatio),
    hingedPlotLerp(start, mid, 0, holeHandleThicknessRatio),
  ];
  const holeTheta = -holeTaper + Math.PI / 2;
  const holeEdges = symmetricHingePlotByProjectionDistance(
    holeBases[0], holeBases[1], holeTheta, tabDepth * holeDepthToTabDepth,
  );

  const handleEdges = symmetricHingePlotByProjectionDistance(start, mid, holeTheta, tabDepth);

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

  cutPath.concatPath(roundedEdgePath([start, handleEdges[0], handleEdges[1], mid], roundingDistance));

  const finPath = roundedEdgePath([finBases[0], backFinEdge, finMidTip, finBases[1]], roundingDistance);
  cutPath.line(finBases[0]).concatPath(finPath.sliceCommandsDangerously(1));
  cutPath.line(finBases[1]);
  cutPath.line(end);
  const scorePath = new PathData();
  scorePath.concatPath(strokeDashPath(start, holeBases[0], scoreDashSpec));
  scorePath.concatPath(strokeDashPath(holeBases[1], mid, scoreDashSpec));
  scorePath.concatPath(strokeDashPath(finBases[0], finBases[1], scoreDashSpec));
  return { cut: cutPath, score: scorePath };
}
