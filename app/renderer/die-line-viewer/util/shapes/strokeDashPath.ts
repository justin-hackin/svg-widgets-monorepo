import sum from 'lodash-es/sum';
import range from 'lodash-es/range';
import { lineLerp, PointLike } from '../geom';
import { PathData } from '../PathData';

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
  strokeDashPathPattern?: StrokeDashPathPatternSpec,
  strokeDashLength: number,
  strokeDashOffsetRatio: number,
}

export function strokeDashPathRatios(
  start: PointLike, end: PointLike, dashSpec: StrokeDashPathSpec,
) {
  const {
    strokeDashPathPattern: { relativeStrokeDasharray },
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
  start: PointLike, end: PointLike, dashSpec: StrokeDashPathSpec,
) {
  return lineSeries(strokeDashPathRatios(start, end, dashSpec)
    .map((startEndLerp) => startEndLerp.map((lerp) => lineLerp(start, end, lerp))));
}
