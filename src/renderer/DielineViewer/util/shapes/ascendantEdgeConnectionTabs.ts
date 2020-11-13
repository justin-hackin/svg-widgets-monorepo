// @ts-ignore
import { range } from 'lodash';
import { Instance, types } from 'mobx-state-tree';

import { PathData } from '../PathData';
import {
  distanceFromOrigin,
  lineLerp,
  PointLike,
  subtractPoints,
  symmetricHingePlotByProjectionDistance,
} from '../../../common/util/geom';
import { IDashPatternModel, strokeDashPathRatios } from './strokeDashPath';
import { subtractRangeSet } from '../../data/range';
import { connectedLineSegments } from './generic';
import { symmetricRoundedTab } from './symmetricRoundedTab';

export const AscendantEdgeTabsModel = types.model({
  flapRoundingDistanceRatio: types.number,
  holeFlapTaperAngle: types.number,
  holeReachToTabDepth: types.number,
  holeWidthRatio: types.number,
  midpointDepthToTabDepth: types.number,
  tabDepthToTraversalLength: types.number,
  tabRoundingDistanceRatio: types.number,
  tabStartGapToTabDepth: types.number,
  tabWideningAngle: types.number,
  tabsCount: types.integer,
});

export interface IAscendantEdgeTabsModel extends Instance<typeof AscendantEdgeTabsModel> {
}

export const ascendantEdgeConnectionTabs = (
  start: PointLike, end: PointLike,
  tabSpec: IAscendantEdgeTabsModel, scoreDashSpec: IDashPatternModel, tabIntervalRatios, tabGapIntervalRatios,
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
  const vector = subtractPoints(end, start);
  const vectorLength = distanceFromOrigin(vector);
  const tabDepth = tabDepthToTraversalLength * vectorLength;
  const tabLength = (vectorLength * holeWidthRatio) / tabsCount;
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

    // @ts-ignore
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
