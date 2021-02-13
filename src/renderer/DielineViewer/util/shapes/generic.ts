import {
  distanceBetweenPoints,
  hingedPlot, PointLike, RawPoint,
} from '../../../common/util/geom';
import { PathData } from '../PathData';

interface RoundPoint {
  point: PointLike,
  retractionDistance: number
}

type RoundPointPointsItem = PointLike | RoundPoint;
const isPointLike = (item: RoundPointPointsItem): item is PointLike => {
  const pt = (item as PointLike);
  return pt.x !== undefined && pt.y !== undefined;
};

const minSegmentLength = (points) => {
  let min = Infinity;
  for (let i = 0; i < points.length - 2; i += 1) {
    const dist = distanceBetweenPoints(points[i], points[i + 1]);
    if (dist < min) { min = dist; }
  }
  return min;
};

export const roundedEdgePath = (points: RoundPointPointsItem[], retractionDistanceRatio: number): PathData => {
  const path = new PathData();
  const retractionDistance = (minSegmentLength(points) * retractionDistanceRatio) / 2;
  const pointOfRoundPoint = (roundPoint: RoundPointPointsItem):RawPoint => ({
    ...(isPointLike(roundPoint)
      ? roundPoint : roundPoint.point),
  });
  path.move(pointOfRoundPoint(points[0]));
  points.slice(1, -1).reduce((acc: PathData, item, pointIndex) => {
    const thisPoint = pointOfRoundPoint(item);
    const thisRetractionDistance = (item as RoundPoint).retractionDistance || retractionDistance;
    const toward = pointOfRoundPoint(points[pointIndex + 2]);
    const fromPoint = pointOfRoundPoint(points[pointIndex]);
    const curveStart = hingedPlot(fromPoint, thisPoint, 0, thisRetractionDistance);
    const curveEnd = hingedPlot(toward, thisPoint, 0, thisRetractionDistance);
    acc.line(curveStart);
    acc.quadraticBezier(thisPoint, curveEnd);
    return acc;
  }, path);
  return path.line(pointOfRoundPoint(points[points.length - 1]));
};

export const connectedLineSegments = (points: PointLike[]) => {
  const path = new PathData();
  path.move(points[0]);
  for (const pt of points.slice(1)) {
    path.line(pt);
  }
  return path;
};

export const closedPolygonPath = (points: PointLike[]) => connectedLineSegments(points).close();
