// @ts-ignore
import { Line, Point, Polygon } from '@flatten-js/core';
import { subtract } from '@flatten-js/boolean-op';

import { circularSlice } from './data';

export interface PointLike {
  x: number,
  y: number,
  [x: string]: any,
}

export type PointTuple = [number, number];
export type Coord = PointTuple | PointLike;

export const degToRad = (deg) => (deg * 2 * Math.PI) / 360;
export const radToDeg = (rad) => (360 * rad) / (Math.PI * 2);

export const line = (p1, p2) => new Line(new Point(...p1), new Point(...p2));

export function triangleAnglesGivenSides(sideLengths) {
  if (sideLengths.length !== 3) {
    throw new Error('triangleAnglesGivenSides: parameter sideLengths must be array of length 3');
  }
  return sideLengths.map((length, index, lengths) => {
    const [a, b, c] = circularSlice(lengths, index, 3);
    return Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
  });
}

// positive distance is to the right moving from pt1 to pt2
export function hingedPlot(p1:PointLike, p2:PointLike, theta, length) {
  return Point.fromPolar([p1.subtract(p2).angle + theta, length]).add(p2);
}

// positive distance is to the right moving from pt1 to pt2
export function hingedPlotLerp(p1:PointLike, p2:PointLike, theta, lengthRatio) {
  const difference = p1.subtract(p2);
  return Point.fromPolar([difference.angle + theta, difference.length * lengthRatio]).add(p2);
}

export function lineLerp(start, end, lerp) {
  const difference = end.subtract(start);
  return start.add(Point.fromPolar([difference.angle, difference.length * lerp]));
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

export function hingedPlotByProjectionDistance(pt1, pt2, angle, projectionDistance) {
  const l1 = new Line(...parallelLinePointsAtDistance(pt1, pt2, projectionDistance));
  const hinge = hingedPlot(pt1, pt2, angle, Math.abs(projectionDistance));
  const l2 = new Line(pt2, hinge);
  const intersections = l2.intersect(l1);
  return intersections.length === 1 ? intersections[0] : null;
}

export function symmetricHingePlotByProjectionDistance(p1, p2, theta, distance) {
  return [
    hingedPlotByProjectionDistance(p2, p1, theta, -distance),
    hingedPlotByProjectionDistance(p1, p2, -theta, distance),
  ];
}


export function intersectLineLine(l1p1, l1p2, l2p1, l2p2) {
  const l1 = new Line(l1p1, l1p2);
  const l2 = new Line(l2p1, l2p2);
  const intersections = l2.intersect(l1);
  return intersections.length === 1 ? intersections[0] : null;
}


export function symmetricHingePlotIntersection(p1, p2, theta, length) {
  const [pp1, pp2] = symmetricHingePlot(p1, p2, theta, length);
  return intersectLineLine(p1, pp1, p2, pp2);
}

export function insetPoints(vectors, distance) {
  const returnVal = [];
  vectors.forEach((vector, i) => {
    const vec = circularSlice(vectors, i, vectors.length);
    const l1 = parallelLineAtDistance(vec[1], vec[0], distance);
    const l2 = parallelLineAtDistance(vec[2], vec[1], distance);
    const intersections = l1.intersect(l2);
    returnVal.push(intersections[0]);
  });

  return returnVal;
}

export const subtractPointsArrays = (pts1, pts2) => {
  const polygon1 = new Polygon();
  polygon1.addFace(pts1);

  const polygon2 = new Polygon();
  polygon2.addFace(pts2);

  return subtract(polygon1, polygon2);
};
