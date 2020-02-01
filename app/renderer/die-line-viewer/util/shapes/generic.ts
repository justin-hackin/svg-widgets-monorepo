import {hingedPlot, PointLike} from '../geom';
import {COMMAND_FACTORY, PathData} from '../PathData';
import last from 'lodash-es/last';

interface RoundPoint {
  point: PointLike,
  retractionDistance: number
}

// TODO: appears this is incoorect
type RoundPointPointsItem = PointLike | RoundPoint;
// https://github.com/alexbol99/flatten-js/issues/14
export const roundedEdgePath = (points: RoundPointPointsItem[], retractionDistance: number): PathData => {
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
export const moveLines = (points) => points.map((point, index) => COMMAND_FACTORY[index ? 'L' : 'M'](point));
