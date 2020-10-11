// @ts-ignore
import { Point } from '@flatten-js/core';
import { last, range } from 'lodash';
import { PathData } from '../PathData';
import { lineLerp, PointLike, symmetricHingePlotByProjectionDistance } from '../../../common/util/geom';
import { strokeDashPath, strokeDashPathRatios } from './strokeDashPath';
import { subtractRangeSet } from '../../data/range';
import { connectedLineSegments } from './generic';
import { DOTTED_SCORES, MIRRORED_STROKES } from '../../config';
import { symmetricRoundedTab } from './symmetricRoundedTab';
import { IAscendantEdgeTabsModel, IStrokeDashPathPatternModel } from '../../data/PyramidNetStore';

export const ascendantEdgeConnectionTabs = (
  start: PointLike, end: PointLike,
  tabSpec: IAscendantEdgeTabsModel, scoreDashSpec: IStrokeDashPathPatternModel, tabIntervalRatios, tabGapIntervalRatios,
): AscendantEdgeConnectionPaths => {
  const {
    holeFlapTaperAngle,
    holeReachToTabDepth,
    holeWidthRatio,
    midpointDepthToTabDepth,
    tabDepthToTraversalLength,
    tabRoundingDistanceRatio,
    tabsCount,
    tabWideningAngle,
  } = tabSpec;

  const getTabBaseInterval = (tabNum) => [
    lineLerp(start, end, tabIntervalRatios[tabNum][0]),
    lineLerp(start, end, tabIntervalRatios[tabNum][1]),
  ];

  const maleScoreLineIntervals = [];
  const getFemaleScorePathData = () => {
    if (MIRRORED_STROKES && DOTTED_SCORES) {
      return new PathData();
    }
    return range(tabsCount - 1).reduce((acc, tabIndex) => {
      const [, previousBaseEnd] = getTabBaseInterval(tabIndex);
      const [nextBaseStart] = getTabBaseInterval(tabIndex + 1);

      acc.concatPath(strokeDashPath(previousBaseEnd, nextBaseStart, scoreDashSpec));
      return acc;
    }, (new PathData()).concatPath(strokeDashPath(
      start,
      getTabBaseInterval(0)[0],
      scoreDashSpec,
    )))
      .concatPath(strokeDashPath(getTabBaseInterval(tabsCount - 1)[1], end, scoreDashSpec));
  };

  const getMaleScorePathData = () => {
    if (MIRRORED_STROKES && DOTTED_SCORES) {
      return new PathData();
    }
    return range(tabsCount).reduce((acc, tabIndex) => {
      const [tabStart, tabEnd] = getTabBaseInterval(tabIndex);

      acc.concatPath(strokeDashPath(tabStart, tabEnd, scoreDashSpec));
      return acc;
    }, (new PathData()));
  };

  const commands = {
    female: {
      cut: (new PathData()),
      score: getFemaleScorePathData(),
    },
    male: {
      cut: (new PathData()).move(start),
      score: getMaleScorePathData(),
    },
  };
  const vector = end.subtract(start);
  const tabDepth = tabDepthToTraversalLength * vector.length;
  const tabLength = (vector.length * holeWidthRatio) / tabsCount;
  const tabDepthToBaseLength = tabDepth / tabLength;
  range(0, tabsCount).forEach((tabNum) => {
    const [tabBaseStart, tabBaseEnd] = getTabBaseInterval(tabNum);
    const [holeEdgeStart, holeEdgeEnd] = symmetricHingePlotByProjectionDistance(
      tabBaseStart, tabBaseEnd, -Math.PI / 2 + holeFlapTaperAngle, holeReachToTabDepth * -tabDepth,
    );

    commands.male.cut.line(tabBaseStart);

    const { path: tabPath } = symmetricRoundedTab(
      tabBaseStart, tabBaseEnd,
      midpointDepthToTabDepth, tabDepthToBaseLength, tabRoundingDistanceRatio, tabWideningAngle,
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
  if (DOTTED_SCORES && MIRRORED_STROKES) {
    const dashRatios = strokeDashPathRatios(start, end, scoreDashSpec);
    const tabDashRatios = subtractRangeSet(dashRatios, tabIntervalRatios);
    const tabGapDashRatios = subtractRangeSet(dashRatios, tabGapIntervalRatios);

    for (const [femaleStart, femaleEnd] of tabDashRatios) {
      commands.female.score.move(lineLerp(start, end, femaleStart)).line(lineLerp(start, end, femaleEnd));
    }
    for (const [maleStart, maleEnd] of tabGapDashRatios) {
      commands.male.score.move(lineLerp(start, end, maleStart)).line(lineLerp(start, end, maleEnd));
    }
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
