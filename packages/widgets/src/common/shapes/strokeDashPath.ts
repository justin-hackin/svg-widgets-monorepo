import {
  chunk, last, range, startCase, sum, uniq,
} from 'lodash-es';
import {
  customRef, detach, getRootPath, Model, model, prop,
} from 'mobx-keystone';

import { computed } from 'mobx';
import { PathData, PointLike } from 'fluent-svg-path-ts';
import { assertNotNullish, referenceSelectProp, sliderWithTextProp } from 'svg-widget-studio';
import { distanceFromOrigin, lineLerp, subtractPoints } from '../util/geom';
import { ratioSliderProps } from '../../widgets/PyramidNet/constants';
import { DEFAULT_SLIDER_STEP } from '@/common/constants';

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

const STROKE_DASH_PATH_PATTERN_MODEL_TYPE = 'StrokeDashPathPatternModel';

@model(STROKE_DASH_PATH_PATTERN_MODEL_TYPE)
export class StrokeDashPathPatternModel extends Model({
  relativeStrokeDasharray: prop<number[]>(),
}) {
  @computed
  get label() {
    return chunk(this.relativeStrokeDasharray, 2).map(([stroke, gap]) => `● ${stroke} ○ ${gap}`).join(' ');
  }

  getRefId() {
    return this.label;
  }

  onInit() {
    if (this.relativeStrokeDasharray.length % 2 !== 0) {
      throw new Error('relativeStrokeDasharray was not divisible by 2');
    }
  }
}

export const dashPatternsById = dasharrays.reduce((acc, relativeStrokeDasharray) => {
  const inst = new StrokeDashPathPatternModel({
    relativeStrokeDasharray,
  });
  acc[inst.label] = inst;
  return acc;
}, {} as Record<string, StrokeDashPathPatternModel>);

const patternRef = customRef<StrokeDashPathPatternModel>(`${STROKE_DASH_PATH_PATTERN_MODEL_TYPE}--ref`, {
  onResolvedValueChange(ref, newInst, oldInst) {
    if (oldInst && !newInst) {
      detach(ref);
    }
  },
  resolve(ref) {
    return dashPatternsById[ref.id];
  },
});

const options = Object.values(dashPatternsById);
const strokeLengthProps = { min: 1, max: 100, step: DEFAULT_SLIDER_STEP };
@model('DashPatternModel')
export class DashPatternModel extends Model({
  strokeDashPathPattern: referenceSelectProp<StrokeDashPathPatternModel>(options[0], {
    labelOverride: (node) => {
      const { path } = getRootPath(node);
      if (path.length) {
        const parentName = `${path[path.length - 2]}`;
        return `${startCase(parentName)} Pattern`;
      }
      // this should never happen
      return node.ownPropertyName || '';
    },
    typeRef: patternRef,
    options,
    optionLabelMap: (option) => option.label,
  }),
  strokeDashLength: sliderWithTextProp(11, {
    ...strokeLengthProps,
  }),
  strokeDashOffsetRatio: sliderWithTextProp(0, {
    ...ratioSliderProps,
  }),
}) {
}
type NumberTuple = [number, number];
export type LerpRanges = NumberTuple[];
export function strokeDashPathRatios(
  start: PointLike,
  end: PointLike,
  dashSpec: DashPatternModel | undefined,
): LerpRanges {
  if (!dashSpec) { return [[0, 1]]; }
  const vector = subtractPoints(end, start);
  const vectorLength = distanceFromOrigin(vector);
  const {
    strokeDashPathPattern: { value: { relativeStrokeDasharray } = {} } = {},
    strokeDashLength: { value: strokeDashLength },
    strokeDashOffsetRatio: { value: strokeDashOffsetRatio },
  } = dashSpec;
  const strokeDashLengthToVectorLength = strokeDashLength / vectorLength;
  assertNotNullish(relativeStrokeDasharray);
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
  }, { at: 0, lerps: [] } as { at: number, lerps: LerpRanges }).lerps;

  const iterationsRequiredForCoverage = Math.ceil(vectorLength / strokeDashLength);
  return range(iterationsRequiredForCoverage)
  // compute the start-end lerps relative to the start - end vector
    .reduce((acc, iterIndex) => {
      const lerpOffset = iterIndex * strokeDashLengthToVectorLength;
      const lerpTransform = (lerp:number):number => lerp * strokeDashLengthToVectorLength + lerpOffset;
      const transformed = startEndLerps.map((el) => el.map(lerpTransform)) as LerpRanges;
      return acc.concat(transformed);
    }, [] as LerpRanges)
    // remove line segments that lie fully outside the start-end vector
    .filter(([startLerp, endLerp]) => startLerp <= 1 && endLerp <= 1)
    // nudge the segments forward based on strokeDashOffsetRatio, wrapping and/or splicing where necessary
    .reduce((acc, startEndLerp) => {
      const startEndLerpNew = startEndLerp.map(
        (val) => val + strokeDashOffsetRatio * strokeDashLengthToVectorLength,
      ) as NumberTuple;
      // the whole segment is past the edges of the vector, wrap whole thing
      if (startEndLerpNew[0] >= 1) {
        acc.push(startEndLerpNew.map(wrapRatio) as NumberTuple);
        return acc;
      }
      // start lies within but end lies without, discard
      if (startEndLerpNew[1] > 1) {
        return acc;
      }
      acc.push(startEndLerpNew);
      return acc;
    }, [] as LerpRanges)
    // visually this should not make difference but better for plotters that don't optimize
    .sort(([start1], [start2]) => (start1 - start2))
    // center items so that the start and end points do not touch the cut
    .map((item, index, array) => item.map((val) => val + (1 - last(array)![1]) / 2)) as LerpRanges;
}

export function strokeDashPath(start: PointLike, end: PointLike, dashSpec: DashPatternModel | undefined) {
  const ratios = strokeDashPathRatios(start, end, dashSpec);
  return lineSeries(ratios
    .map((startEndLerp) => startEndLerp.map((lerp) => lineLerp(start, end, lerp))));
}
