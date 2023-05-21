import { range } from 'lodash-es';
import { Model, model, prop } from 'mobx-keystone';
import { RawPoint } from '@/common/PathData/types';
import { PathData } from '../../common/PathData';
import {
  hingedPlot, lineLerp, symmetricHingePlotByProjectionDistance,
} from '../../common/util/geom';
import { DashPatternModel, strokeDashPathRatios } from '../../common/shapes/strokeDashPath';
import { connectedLineSegments } from '../../common/shapes/generic';
import { sliderProp, sliderWithTextProp } from '../../common/keystone-tweakables/props';
import { subtractRangeSet } from './range';
import { ratioSliderProps } from './constants';
import { DEFAULT_SLIDER_STEP } from '../../common/constants';

@model('AscendantEdgeTabsModel')
export class AscendantEdgeTabsModel extends Model({
  // TODO: consider making these constants or give controls
  holeFlapTaperAngle: prop(0.31),
  midpointDepthToTabDepth: prop(0.5),
  tabsCount: sliderProp(3, { min: 1, max: 5, step: 1 }),
  tabDepthToTraversalLength: sliderWithTextProp(0.0375, {
    min: 0.03, max: 0.05, step: 0.0001,
  }),
  holeReachToTabDepth: sliderWithTextProp(0.1, {
    min: 0.05, max: 0.2, step: DEFAULT_SLIDER_STEP,
  }),
  tabEdgeEndpointsIndentation: sliderWithTextProp(1, {
    min: 0, max: 2, step: DEFAULT_SLIDER_STEP,
  }),
  tabControlPointsProtrusion: sliderWithTextProp(0.93, ratioSliderProps),
  tabControlPointsAngle: sliderWithTextProp(0.8, ratioSliderProps),
  tabStartGapToTabDepth: sliderWithTextProp(1, {
    min: 0.3, max: 2, step: DEFAULT_SLIDER_STEP,
  }),
  holeWidthRatio: sliderProp(0.5, {
    min: 0.1, max: 0.9, step: DEFAULT_SLIDER_STEP,
  }),
  flapRoundingDistanceRatio: sliderProp(1, ratioSliderProps),
}) {}

export const ascendantEdgeConnectionTabs = (
  start: RawPoint,
  end: RawPoint,
  tabSpec: AscendantEdgeTabsModel,
  scoreDashSpec: DashPatternModel | undefined,
  tabIntervalRatios,
  tabGapIntervalRatios,
  tabDepth: number,
): AscendantEdgeConnectionPaths => {
  const {
    holeFlapTaperAngle,
    holeReachToTabDepth: { value: holeReachToTabDepth },
    tabsCount: { value: tabsCount },
    tabControlPointsProtrusion: { value: tabControlPointsProtrusion },
    tabControlPointsAngle: { value: tabControlPointsAngle },
    tabEdgeEndpointsIndentation: { value: tabEdgeEndpointsIndentation },
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

  range(0, tabsCount).forEach((tabNum) => {
    const [tabBaseStart, tabBaseEnd] = getTabBaseInterval(tabNum);
    const [holeEdgeStart, holeEdgeEnd] = symmetricHingePlotByProjectionDistance(
      tabBaseStart,
      tabBaseEnd,
      -Math.PI / 2 + holeFlapTaperAngle,
      holeReachToTabDepth * -tabDepth,
    );
    const [tabEdgeStartUnindented, tabEdgeEndUnindented] = symmetricHingePlotByProjectionDistance(
      tabBaseStart,
      tabBaseEnd,
      Math.PI / 2,
      tabDepth,
    );

    const controlPointDistance = tabDepth * tabControlPointsProtrusion;
    const edgeInsetDistance = tabEdgeEndpointsIndentation * tabDepth;
    const baseControlAngleMux = tabControlPointsAngle * (Math.PI / 2);
    const tabEdgeStart = hingedPlot(tabEdgeEndUnindented, tabEdgeStartUnindented, 0, edgeInsetDistance);
    const tabEdgeEnd = hingedPlot(tabEdgeStartUnindented, tabEdgeEndUnindented, 0, edgeInsetDistance);
    const baseControlPointStart = hingedPlot(
      tabBaseEnd,
      tabBaseStart,
      Math.PI - baseControlAngleMux,
      controlPointDistance,
    );
    const baseControlPointEnd = hingedPlot(
      tabBaseStart,
      tabBaseEnd,
      Math.PI + baseControlAngleMux,
      controlPointDistance,
    );
    const edgeControlPointStart = hingedPlot(tabEdgeEnd, tabEdgeStart, Math.PI, controlPointDistance);
    const edgeControlPointEnd = hingedPlot(tabEdgeStart, tabEdgeEnd, Math.PI, controlPointDistance);

    commands.male.cut.line(tabBaseStart)
      .cubicBezier(baseControlPointStart, edgeControlPointStart, tabEdgeStart)
      .line(tabEdgeEnd)
      .cubicBezier(edgeControlPointEnd, baseControlPointEnd, tabBaseEnd);

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

export interface AscendantEdgeConnectionPaths {
  female: {
    cut: PathData,
    score: PathData,
  }
  male: {
    cut: PathData,
    score: PathData,
  }
}
