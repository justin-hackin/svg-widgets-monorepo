import { last } from 'lodash';
import { hingedPlot, PointLike } from '../geom';
import { PathData } from '../PathData';

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

export const connectedLineSegments = (points) => {
  const path = new PathData();
  path.move(points[0]);
  for (const pt of points.slice(1)) {
    path.line(pt);
  }
  return path;
};

export const closedPolygonPath = (points) => connectedLineSegments(points).close();
