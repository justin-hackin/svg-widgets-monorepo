import {
  // @ts-ignore
  Line, point, Polygon, segment,
} from '@flatten-js/core';
import { isNaN, range } from 'lodash-es';
import offset from '@flatten-js/polygon-offset';

import type { PointLike, RawPoint } from '@/common/PathData/types';
import { castCoordToRawPoint } from '@/common/PathData/geom';
import { circularSlice } from './data';

// NOTE: where possible, avoid direct use of flatten-js classes and instead use RawPoint or construct helper function
// flatten-js is designed to conform to formal mathematical definitions and has an inconvenient interface
// vectors have arithmetic operators but can't be used to construct polygons and lines.
// Points can be used to construct polygons and lines, but don't have arithmetic operators
// flatten-js is designed to directly render DOM strings and is ill-suited for use with React
// e.g. if you construct a Polygon, there's no documented way to get a path d-attribute for that polygon,
// there's only a way to render it to a DOM string containing a <path>
// (blurs separation of concerns between data and view)
// However, flatten-js features many valuable computations that are not present in other libraries

export const PHI:number = (1 + Math.sqrt(5)) / 2;

export const pointFromPolar = (theta: number, length: number):RawPoint => ({
  x: Math.cos(theta) * length, y: Math.sin(theta) * length,
});
export const pointsAreEqual = (pt1, pt2, marginOfError = 0.01) => (
  Math.abs(pt1.x - pt2.x) < marginOfError && Math.abs(pt1.y - pt2.y) < marginOfError);

export const distanceFromOrigin = ({ x, y }) => Math.sqrt(x ** 2 + y ** 2);
export const angleRelativeToOrigin = ({ x, y }) => Math.atan2(y, x);

export function triangleAnglesGivenSides(sideLengths) {
  if (sideLengths.length !== 3) {
    throw new Error('triangleAnglesGivenSides: parameter sideLengths must be array of length 3');
  }
  return sideLengths.map((length, index, lengths) => {
    const [a, b, c] = circularSlice(lengths, index, 3);
    return Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
  });
}

export const transformPoint = (matrix: DOMMatrixReadOnly, pt: PointLike): RawPoint => {
  const domPoint = matrix.transformPoint(new DOMPoint(pt.x, pt.y));
  return castCoordToRawPoint(domPoint);
};
export const getOriginPoint = (): RawPoint => ({ x: 0, y: 0 });

export const sumPoints = (...points: PointLike[]): RawPoint => (points as RawPoint[])
  .reduce((acc, pt) => {
    acc.x += pt.x;
    acc.y += pt.y;
    return acc;
  }, getOriginPoint());

export const scalePoint = (pt: PointLike, scale: number): RawPoint => ({ x: pt.x * scale, y: pt.y * scale });

export const subtractPoints = (p1, p2) => sumPoints(p1, scalePoint(p2, -1));

export const matrixWithTransformOrigin = (origin: RawPoint, matrix) => {
  const negatedOrigin = scalePoint(origin, -1);
  return (new DOMMatrixReadOnly())
    .translate(origin.x, origin.y)
    .multiply(matrix)
    .translate(negatedOrigin.x, negatedOrigin.y);
};

export const calculateTransformOriginChangeOffset = (
  oldTransformOrigin,
  newTransformOrigin,
  scale,
  rotation,
  translation,
) => {
  const uncenteredMatrix = (new DOMMatrixReadOnly()).scale(scale, scale).rotate(rotation);
  const newMatrix = matrixWithTransformOrigin(newTransformOrigin, uncenteredMatrix);
  const oldMatrix = matrixWithTransformOrigin(oldTransformOrigin, uncenteredMatrix);
  return sumPoints(
    transformPoint(newMatrix, translation),
    scalePoint(transformPoint(oldMatrix, translation), -1),
  );
};

export const getTextureTransformMatrix = (origin: RawPoint, scale, rotation, translation) => (new DOMMatrixReadOnly())
  .translate(translation.x, translation.y)
  .multiply(matrixWithTransformOrigin(origin, (new DOMMatrixReadOnly()).scale(scale, scale).rotate(rotation)));

// positive distance is to the right moving from pt1 to pt2
export function hingedPlot(p1:PointLike, p2:PointLike, theta, length):RawPoint {
  return sumPoints(
    pointFromPolar(angleRelativeToOrigin(subtractPoints(p1, p2)) + theta, length),
    p2,
  );
}

export const polygonPointsGivenAnglesAndSides = (angles, sides): RawPoint[] => {
  if (sides.length !== angles.length) {
    throw new Error('polygonPointsGivenSidesAndAngles: length of sides is not equal to length of angles');
  }
  return range(2, sides.length).reduce((acc, i) => {
    acc.push(hingedPlot(acc[i - 2], acc[i - 1], angles[i - 2], sides[i - 1]));
    return acc;
  }, [getOriginPoint(), pointFromPolar(Math.PI - angles[0], sides[0])]);
};

// positive distance is to the right moving from pt1 to pt2
export function hingedPlotLerp(p1:PointLike, p2:PointLike, theta, lengthRatio) {
  const difference = subtractPoints(p1, p2);

  return sumPoints(
    p2,
    pointFromPolar(
      angleRelativeToOrigin(difference) + theta,
      distanceFromOrigin(difference) * lengthRatio,
    ),
  );
}

export function lineLerp(start, end, lerp) {
  const difference = subtractPoints(end, start);
  return sumPoints(start, pointFromPolar(angleRelativeToOrigin(difference), distanceFromOrigin(difference) * lerp));
}

export function parallelLineAtDistance(pt1, pt2, distance) {
  const sign = distance < 0 ? -1 : 1;
  const absDist = Math.abs(distance);
  return new Line(
    hingedPlot(pt2, pt1, sign * (Math.PI / 2), absDist),
    hingedPlot(pt1, pt2, -sign * (Math.PI / 2), absDist),
  );
}

export function symmetricHingePlot(p1, p2, theta, length) {
  return [
    hingedPlot(p2, p1, theta, length),
    hingedPlot(p1, p2, -theta, length),
  ];
}

export function parallelLinePointsAtDistance(pt1, pt2, distance) {
  const sign = distance < 0 ? -1 : 1;
  const absDist = Math.abs(distance);
  return [
    hingedPlot(pt2, pt1, sign * (Math.PI / 2), absDist),
    hingedPlot(pt1, pt2, -sign * (Math.PI / 2), absDist),
  ];
}

const rawToFlattenPoint = ({ x, y }) => point(x, y);

export const getLineLineIntersection = (l1p1, l1p2, l2p1, l2p2) => {
  const l1 = new Line(rawToFlattenPoint(l1p1), rawToFlattenPoint(l1p2));
  const intersections = l1.intersect(new Line(rawToFlattenPoint(l2p1), rawToFlattenPoint(l2p2)));
  return intersections.length === 1 ? castCoordToRawPoint(intersections[0]) : null;
};

export function hingedPlotByProjectionDistance(pt1, pt2, angle, projectionDistance): RawPoint {
  if (angle === 0) {
    // so that our type coercion is accurate
    throw new Error('hingedPlotByProjectionDistance: angle must not be zero');
  }
  const hinge = hingedPlot(pt1, pt2, angle, Math.abs(projectionDistance));
  const [l1p1, l1p2] = parallelLinePointsAtDistance(pt1, pt2, projectionDistance);
  return getLineLineIntersection(l1p1, l1p2, pt2, hinge) as RawPoint;
}

export function symmetricHingePlotByProjectionDistance(p1, p2, theta, distance) {
  return [
    hingedPlotByProjectionDistance(p2, p1, theta, -distance),
    hingedPlotByProjectionDistance(p1, p2, -theta, distance),
  ];
}

export const distanceBetweenPoints = (pt1: PointLike, pt2: PointLike):number => distanceFromOrigin(
  subtractPoints(pt2, pt1),
);
export const isValidNumber = (num) => typeof num === 'number' && !isNaN(num);

export const polygonWithFace = (faceVertices: PointLike[]) => {
  if (faceVertices.length < 3) {
    throw new Error('polygonWithFace: face parameter must have 3 or more elements');
  }
  const theFace = faceVertices.map((pt1, index) => {
    const pt2 = faceVertices[(index + 1) % faceVertices.length];
    return segment(point(pt1.x, pt1.y), point(pt2.x, pt2.y));
  });
  const poly = new Polygon();
  poly.addFace(theFace);
  return poly;
};

export const offsetPolygonPoints = (points: RawPoint[], offsetDistance) => {
  const poly = polygonWithFace(points);
  const offsetPoly = offset(poly, offsetDistance);
  return offsetPoly.vertices.map(castCoordToRawPoint);
};

export const pointToTranslateString = (pt: RawPoint) => `translate(${pt.x}, ${pt.y})`;
