import Flatten from '@flatten-js/core';
import { PathData } from '../../common/path/PathData';
import { hingedPlot, PointTuple, polygonWithFace } from '../../common/util/geom';
import Segment = Flatten.Segment;
import Point = Flatten.Point;
import Line = Flatten.Line;

const {
  line, point, segment,
} = Flatten;

export const getMarginLength = (
  panelLength: number, numNotches: number, notchSpacing: number, notchThickness: number,
) => {
  const notchesCoverage = (numNotches - 1) * notchSpacing + numNotches * notchThickness;
  return (panelLength - notchesCoverage) / 2;
};

export const notchPanel = (
  firstNotchCenter: number, panelLength: number, panelDepth: number,
  numNotches: number, notchSpacing: number, notchThickness: number, invertXY = false,
): PathData => {
  const pt = (x: number, y: number) => (invertXY ? [y, x] : [x, y]) as PointTuple;
  const path = new PathData();
  const notchDepth = panelDepth / 2;
  path.move([0, 0]);
  const firstNotchStart = firstNotchCenter - (notchThickness / 2);
  for (let i = 0; i < numNotches; i += 1) {
    const notchStartX = i * (notchThickness + notchSpacing) + firstNotchStart;
    path.line(pt(notchStartX, 0))
      .line(pt(notchStartX, notchDepth))
      .line(pt(notchStartX + notchThickness, notchDepth))
      .line(pt(notchStartX + notchThickness, 0));
  }
  return path
    .line(pt(panelLength, 0))
    .line(pt(panelLength, panelDepth))
    .line(pt(0, panelDepth))
    .close();
};

export const centeredNotchPanel = (
  panelLength: number, panelDepth: number,
  numNotches: number, notchSpacing: number, notchThickness: number, invertXY = false,
) => {
  const firstNotchCenter = getMarginLength(panelLength, numNotches, notchSpacing, notchThickness) + notchThickness / 2;
  return notchPanel(firstNotchCenter, panelLength, panelDepth, numNotches, notchSpacing, notchThickness, invertXY);
};

export const getLineLineIntersection = (l1p1: Point, l1p2: Point, l2p1: Point, l2p2: Point) => {
  const l1 = line(l1p1, l1p2);
  const intersections = l1.intersect(line(l2p1, l2p2));
  return intersections.length === 1 ? intersections[0] : null;
};

// slope 1 lines that fit within a box
const boxedDiagonalSegments = (pts, boxWidth, boxHeight) => {
  const poly = polygonWithFace([point(0, 0), point(boxWidth, 0), point(boxWidth, boxHeight), point(0, boxHeight)]);
  return pts.map((pt) => {
    const interLine = line(pt, point(1 + pt.x, -1 + pt.y));
    const intersections = poly.intersect(interLine).sort((first, second) => {
      if (first.y === second.y) { return 0; }
      return first.y < second.y ? -1 : 1;
    });
    if (intersections.length !== 2) {
      throw new Error('expected line to intersect twice with box polygon');
    }

    return segment(intersections[0], intersections[1]);
  });
};

const projectPointOntoLine = (l: Line, pt: Point):Point => {
  const [, { start }] = l.distanceTo(pt);
  return start;
};

export const getNumNotches = (
  panelWidth: number, notchThickness: number, cubbyWidth: number,
) => Math.ceil((panelWidth - notchThickness) / (cubbyWidth + notchThickness));

export const getPositiveSlopeSlatSegments = (
  width: number, height: number, cubbyWidth: number, matThickness: number,
): Segment[] => {
  const backboneLine = line(point(0, 0), point(1, 1));
  const slatBackboneEnd = projectPointOntoLine(backboneLine, point(width, height));
  const backboneSegment = segment(point(0, 0), slatBackboneEnd);
  const backboneLength = backboneSegment.length;
  const numCrosshatches = getNumNotches(backboneLength, matThickness, cubbyWidth);
  const centeringMargin = (backboneLength - ((numCrosshatches - 1) * (cubbyWidth + matThickness))) / 2;
  const vertibrae = [];
  for (let i = 0; i < numCrosshatches; i += 1) {
    const thisDist = centeringMargin + (i * (cubbyWidth + matThickness));
    vertibrae.push(backboneSegment.pointAtLength(thisDist));
  }
  return boxedDiagonalSegments(vertibrae, width, height).filter((segment) => (
    segment.length > (cubbyWidth + matThickness)));
};

const extendSegmentPoints = (ps: Point, pe: Point, dist: number): Point => {
  const rawPt = hingedPlot(ps, pe, dist < 0 ? 0 : Math.PI, Math.abs(dist));
  return point(rawPt.x, rawPt.y);
};

export const augmentSegmentEndpoints = (seg: Segment, endpointDelta: number) => {
  const { ps, pe } = seg;
  return segment(
    extendSegmentPoints(pe, ps, endpointDelta),
    extendSegmentPoints(ps, pe, endpointDelta),
  );
};
