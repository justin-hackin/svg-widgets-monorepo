// eslint-disable-next-line max-classes-per-file
import {
  chunk, last, range, sum, uniq,
} from 'lodash';
import {
  detach, findParent,
  Model, model, modelAction, prop, Ref, rootRef,
} from 'mobx-keystone';

import { computed } from 'mobx';
import {
  distanceFromOrigin, lineLerp, PointLike, subtractPoints,
} from '../../../../common/util/geom';
import { PathData } from '../PathData';
import { PyramidNetPluginModel } from '../../models/PyramidNetMakerStore';

const wrapRatio = (number) => (number > 1 ? number - Math.floor(number) : number);

export function lineSeries(startEndArray) {
  const path = new PathData();
  startEndArray.forEach(([start, end]) => {
    path.move(start).line(end);
  });
  return path;
}
const dasharrays = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 1, 1, 1]];
if (!uniq(dasharrays)) {
  throw new Error('dasharrays contents are not unique');
}

const dasharrayLabelMap = (dasharray) => chunk(dasharray, 2).map(([stroke, gap]) => `● ${stroke} ○ ${gap}`).join(' ');

const STROKE_DASH_PATH_PATTERN_MODEL_TYPE = 'StrokeDashPathPatternModel';

@model(STROKE_DASH_PATH_PATTERN_MODEL_TYPE)
export class StrokeDashPathPatternModel extends Model({
  // TODO: even number length typing?
  relativeStrokeDasharray: prop<number[]>(),
}) { }

const patternRef = rootRef<StrokeDashPathPatternModel>(STROKE_DASH_PATH_PATTERN_MODEL_TYPE, {
  onResolvedValueChange(ref, newInst, oldInst) {
    if (oldInst && !newInst) {
      // if the todo value we were referencing disappeared then remove the reference
      // from its parent
      detach(ref);
    }
  },
});

export const dashPatternsDefaultFn = () => dasharrays.map((relativeStrokeDasharray) => (new StrokeDashPathPatternModel({
  relativeStrokeDasharray,
  $modelId: dasharrayLabelMap(relativeStrokeDasharray),
})));

@model('DashPatternModel')
export class DashPatternModel extends Model({
  strokeDashPathPatternRef: prop<Ref<StrokeDashPathPatternModel>>(),
  strokeDashLength: prop(11),
  strokeDashOffsetRatio: prop(0),
}) {
  protected onAttachedToRootStore(): (() => void) | void {
    const makerStore = findParent<PyramidNetPluginModel>(this,
      (parentNode) => parentNode instanceof PyramidNetPluginModel);
    if (makerStore) {
      this.setStrokeDashPathPattern(makerStore.dashPatterns[0]);
    }
  }

  @computed
  get strokeDashPathPattern() {
    return this.strokeDashPathPatternRef.current;
  }

  @modelAction
  setStrokeDashPathPattern(pattern: StrokeDashPathPatternModel) {
    this.strokeDashPathPatternRef = patternRef(pattern);
  }
}

export function strokeDashPathRatios(
  start: PointLike, end: PointLike, dashSpec: DashPatternModel,
) {
  if (!dashSpec) { return [[0, 1]]; }
  const vector = subtractPoints(end, start);
  const vectorLength = distanceFromOrigin(vector);
  const {
    strokeDashPathPattern: { relativeStrokeDasharray },
    strokeDashLength,
    strokeDashOffsetRatio,
  } = dashSpec;
  const strokeDashLengthToVectorLength = strokeDashLength / vectorLength;

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
  // @ts-ignore
  return range(iterationsRequiredForCoverage)
  // compute the start-end lerps relative to the start - end vector
    .reduce((acc, iterIndex) => {
      const lerpOffset = iterIndex * strokeDashLengthToVectorLength;
      const lerpTransform = (lerp) => lerp * strokeDashLengthToVectorLength + lerpOffset;
      return acc.concat(startEndLerps.map((el) => el.map(lerpTransform)));
    }, [])
    // remove line segments that lie fully outside the start-end vector
    // @ts-ignore
    .filter(([startLerp, endLerp]) => startLerp <= 1 && endLerp <= 1)
    // nudge the segments forward based on strokeDashOffsetRatio, wrapping and/or splicing where necessary
    .reduce((acc, startEndLerp) => {
      // @ts-ignore
      const startEndLerpNew = startEndLerp.map((val) => val + strokeDashOffsetRatio * strokeDashLengthToVectorLength);
      // the whole segment is past the edges of the vector, wrap whole thing
      if (startEndLerpNew[0] >= 1) {
        // @ts-ignore
        acc.push(startEndLerpNew.map(wrapRatio));
        return acc;
      }
      // start lies within but end lies without, discard
      if (startEndLerpNew[1] > 1) {
        return acc;
      }
      // @ts-ignore
      acc.push(startEndLerpNew);
      return acc;
    }, [])
    // visually this should not make difference but better for plotters that don't optimize
    // @ts-ignore
    .sort(([start1], [start2]) => (start1 - start2))
    // center items so that the start and end points do not touch the cut
    // @ts-ignore
    .map((item, index, array) => item.map((val) => val + (1 - last(array)[1]) / 2));
}

export function strokeDashPath(
  start: PointLike, end: PointLike, dashSpec: DashPatternModel,
) {
  const ratios = strokeDashPathRatios(start, end, dashSpec);
  return lineSeries(ratios
    .map((startEndLerp) => startEndLerp.map((lerp) => lineLerp(start, end, lerp))));
}
