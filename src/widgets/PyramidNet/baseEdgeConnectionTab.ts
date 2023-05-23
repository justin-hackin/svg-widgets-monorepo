import {
  Model, model, modelAction, prop,
} from 'mobx-keystone';
import { appendCurvedLineSegments } from '@/common/shapes/generic';
import { PathData, RawPoint } from '@/common/PathData';
import {
  distanceBetweenPoints,
  getLineLineIntersection,
  hingedPlot,
  hingedPlotByProjectionDistance,
  hingedPlotLerp,
  symmetricHingePlotByProjectionDistance,
} from '../../common/util/geom';
import { DashPatternModel, strokeDashPath } from '../../common/shapes/strokeDashPath';
import { arrowTabPlots } from '../../common/shapes/symmetricRoundedTab';
import { sliderProp, sliderWithTextProp, switchProp } from '../../common/keystone-tweakables/props';
import { ratioSliderProps } from './constants';
import { DEFAULT_SLIDER_STEP, VERY_LARGE_NUMBER } from '../../common/constants';

export interface BaseEdgeConnectionTab {
  score: PathData,
  innerCut: PathData,
  boundaryCut: PathData,
}

// "base" is crease upon which the tab folds
// "edge" is opposite the base (most distant from it)
// "depth" is the distance from the base to the edge
// "fin" is the male part of the tab which enters the hole of the tab
// "handle" is the part of the tab that surrounds the hole of the tab
/*
TODO: use of qualifier *Ratio is inconsistent remove all instances,
 in order to qualify properties, use property metadata which accurately describes
 property relationships and displays as tooltip on controls
*/

@model('BendGuideValleyModel')
export class BendGuideValleyModel extends Model({
  depthRatio: sliderProp(0.9, ratioSliderProps),
  theta: sliderWithTextProp(Math.PI / 4, {
    min: Math.PI / 16, max: Math.PI / 3, step: DEFAULT_SLIDER_STEP,
  }),
}) {}

@model('BaseEdgeTabsModel')
export class BaseEdgeTabsModel extends Model({
  roundingDistanceRatio: sliderProp(0.9, {
    min: 0, max: 1, step: 0.1,
  }),
  scoreTabMidline: switchProp(false),
  finDepthToTabDepth: sliderWithTextProp(1.3, { ...ratioSliderProps, min: 0.05 }),
  tabDepthToAscendantTabDepth: sliderWithTextProp(1.5, {
    min: 0.6, max: 2, step: DEFAULT_SLIDER_STEP,
  }),
  holeDepthToTabDepth: sliderWithTextProp(0.5, { ...ratioSliderProps, min: 0.05 }),
  // set by applyShapeBasedDefaults
  finOffsetRatio: sliderProp(0.75, { ...ratioSliderProps, max: 0.99 }),
  holeBreadthToHalfWidth: sliderWithTextProp(0.25, {
    min: 0.05, max: 0.95, step: DEFAULT_SLIDER_STEP,
  }),
  holeTabClearance: sliderWithTextProp(0.1, {
    min: 0, max: 0.1, step: DEFAULT_SLIDER_STEP,
  }),
  // set by applyShapeBasedDefaults,
  holeTaper: sliderWithTextProp(0.97, {
    min: Math.PI / 8, max: Math.PI / 3, step: DEFAULT_SLIDER_STEP,
  }),
  tabConjunctionClearance: sliderWithTextProp(0.1, {
    min: 0.05, max: 0.4, step: 0.01,
  }),
  bendGuideValley: prop<BendGuideValleyModel | undefined>(() => undefined).withSetter(),
}) {
  @modelAction
  unsetBendGuideValley() {
    this.setBendGuideValley(undefined);
  }

  @modelAction
  resetBendGuideValleyToDefault() {
    this.setBendGuideValley(new BendGuideValleyModel({}));
  }
}

export function baseEdgeConnectionTab(
  start: RawPoint,
  end: RawPoint,
  tabDepth,
  tabSpec: BaseEdgeTabsModel,
  scoreDashSpec: DashPatternModel | undefined,
): BaseEdgeConnectionTab {
  const {
    bendGuideValley,
    holeDepthToTabDepth: { value: holeDepthToTabDepth },
    holeTaper: { value: holeTaper },
    holeBreadthToHalfWidth: { value: holeBreadthToHalfWidth },
    finDepthToTabDepth: { value: finDepthToTabDepth },
    finOffsetRatio: { value: finOffsetRatio },
    scoreTabMidline: { value: scoreTabMidline },
    roundingDistanceRatio: { value: roundingDistanceRatio },
    holeTabClearance: { value: holeTabClearance },
    tabConjunctionClearance: { value: tabConjunctionClearance },
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

  const clearanceLength = tabDepth * tabConjunctionClearance;
  // nudge the hole protrusion and tab away from the pyramid net in order to lessen hard angles
  // which cause problems with a drag-blade in a home cutting machine

  const holeBasesClearance = [
    hingedPlotByProjectionDistance(start, holeBases[0], Math.PI / 2, clearanceLength),
    hingedPlotByProjectionDistance(start, holeBases[1], Math.PI / 2, clearanceLength),
  ];

  const holeTheta = -holeTaper + Math.PI / 2;
  const holeEdges = symmetricHingePlotByProjectionDistance(
    holeBasesClearance[0],
    holeBasesClearance[1],
    holeTheta,
    tabDepth * holeDepthToTabDepth,
  );

  const finBases = [
    hingedPlotLerp(end, mid, 0, inLengthRatio),
    hingedPlotLerp(mid, end, 0, outLengthRatio),
  ];

  const finBasesClearance = [
    hingedPlotByProjectionDistance(start, finBases[0], Math.PI / 2, clearanceLength),
    hingedPlotByProjectionDistance(start, finBases[1], Math.PI / 2, clearanceLength),
  ];

  const finDepth = finDepthToTabDepth * tabDepth;
  const finTraversal = distanceBetweenPoints(finBases[0], finBases[1]);
  // for plotting points only, need rounding clamp based on all roundings
  const { tabMidpoints, tabApexes } = arrowTabPlots(
    finBasesClearance[0],
    finBasesClearance[1],
    0.5,
    finDepth / finTraversal,
    holeTheta,
  );

  innerCut
    .move(holeBases[0])
    .line(holeBases[1])
    .line(holeBasesClearance[1]);
  appendCurvedLineSegments(innerCut, [holeEdges[1], holeEdges[0], holeBasesClearance[0]], roundingDistanceRatio);
  innerCut.close();

  const baseHandleEnd = hingedPlot(start, finBases[0], 0, clearanceLength * 2);
  const handleEdges = [
    hingedPlotByProjectionDistance(baseHandleEnd, start, holeTheta, -tabDepth),
    // TODO: should this go back to symmetric?
    hingedPlotByProjectionDistance(start, baseHandleEnd, Math.PI * 0.6, tabDepth),
  ];
  const handleCornerPoints = [handleEdges[0]];

  if (bendGuideValley) {
    const { depthRatio: { value: valleyDepthRatio }, theta: { value: valleyTheta } } = bendGuideValley;
    const handleValleyDip = hingedPlot(end, mid, Math.PI / 2, valleyDepthRatio * tabDepth);
    const handleValleyEdgeCasters = [
      hingedPlot(mid, handleValleyDip, Math.PI + valleyTheta, VERY_LARGE_NUMBER),
      hingedPlot(mid, handleValleyDip, Math.PI - valleyTheta, VERY_LARGE_NUMBER),
    ];
    const handleValleyEdges = handleValleyEdgeCasters.map(
      (castPt) => getLineLineIntersection(handleEdges[0], handleEdges[1], handleValleyDip, castPt),
    ) as RawPoint[];
    handleCornerPoints.push(handleValleyEdges[0], handleValleyDip, handleValleyEdges[1]);
  }
  handleCornerPoints.push(handleEdges[1], baseHandleEnd);
  boundaryCut.move(start);
  appendCurvedLineSegments(boundaryCut, handleCornerPoints, roundingDistanceRatio);
  appendCurvedLineSegments(boundaryCut, [finBases[0], finBasesClearance[0], tabMidpoints[0]], 0.5);
  boundaryCut.popCommand();
  appendCurvedLineSegments(
    boundaryCut,
    [tabMidpoints[0], tabApexes[0], tabApexes[1], tabMidpoints[1], finBasesClearance[1]],
    roundingDistanceRatio,
  );
  boundaryCut.popCommand();
  appendCurvedLineSegments(boundaryCut, [finBasesClearance[1], finBases[1], end], 0.5);

  score.concatPath(strokeDashPath(finBases[0], finBases[1], scoreDashSpec));
  if (scoreTabMidline) {
    // TODO: this score doesn't meet with rounded tab edges, use bezier formula to find match
    score.concatPath(strokeDashPath(tabMidpoints[0], tabMidpoints[1], scoreDashSpec));
  }
  score.concatPath(strokeDashPath(start, holeBases[0], scoreDashSpec));
  score.concatPath(strokeDashPath(holeBases[1], finBases[0], scoreDashSpec));

  return { innerCut, boundaryCut, score };
}
