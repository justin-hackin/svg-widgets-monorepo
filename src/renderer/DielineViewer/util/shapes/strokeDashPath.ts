import { last, range, sum } from 'lodash';
import { Instance, types } from 'mobx-state-tree';

import { lineLerp, PointLike } from '../../../common/util/geom';
import { PathData } from '../PathData';
import { DOTTED_SCORES } from '../../config';
import { dashPatterns, IStrokeDashPathPatternModel } from '../../data/dash-patterns';

const wrapRatio = (number) => (number > 1 ? number - Math.floor(number) : number);

export function lineSeries(startEndArray) {
  const path = new PathData();
  startEndArray.forEach(([start, end]) => {
    path.move(start).line(end);
  });
  return path;
}

export const DashPatternModel = types.model({
  strokeDashPathPatternId: types.string,
  strokeDashLength: types.number,
  strokeDashOffsetRatio: types.number,
}).views((self) => ({
  get pathPattern(): IStrokeDashPathPatternModel {
    // @ts-ignore
    return dashPatterns[self.strokeDashPathPatternId];
  },
}));

export interface IDashPatternModel extends Instance<typeof DashPatternModel> {
}

export function strokeDashPathRatios(
  start: PointLike, end: PointLike, dashSpec: IDashPatternModel,
) {
  const {
    pathPattern: { relativeStrokeDasharray },
    strokeDashLength,
    strokeDashOffsetRatio,
  } = dashSpec;
  const vector = end.subtract(start);
  const vectorLength = vector.length;
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
  start: PointLike, end: PointLike, dashSpec: IDashPatternModel,
) {
  if (!DOTTED_SCORES) {
    return (new PathData()).move(start).line(end);
  }
  const ratios = strokeDashPathRatios(start, end, dashSpec);
  return lineSeries(ratios
    .map((startEndLerp) => startEndLerp.map((lerp) => lineLerp(start, end, lerp))));
}
