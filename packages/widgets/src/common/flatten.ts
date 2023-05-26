// This file exists to fix destructured imports in Flatten
// https://github.com/alexbol99/flatten-js/issues/98

import Flatten from '@flatten-js/core';

const {
  Box,
  Point,
  Ray,
  Vector,
  Segment,
  point,
  circle,
  // @ts-ignore
  box,
  segment,
} = Flatten;
export type FlattenBox = Flatten.Box;
export type FlattenPoint = Flatten.Point;
export type FlattenRay = Flatten.Ray;
export type FlattenVector = Flatten.Vector;
export type FlattenSegment = Flatten.Segment;
export type FlattenCircle = Flatten.Circle;

// Missing in their typedefs
// eslint-disable-next-line @typescript-eslint/no-redeclare
type box = (xmin?: number, ymin?: number, xmax?: number, ymax?: number) => FlattenBox;

export {
  Box, Point, Ray, Vector, Segment, point, circle, box, segment,
};
