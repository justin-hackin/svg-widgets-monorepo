import {
  Coord, PointLike, PointTuple, RawPoint,
} from '@/common/PathData/types';

export function isPointLike(coord: Coord): coord is PointLike {
  return Number.isFinite((coord as PointLike).x) && Number.isFinite((coord as PointLike).y);
}

export function assertCoordinateFinite(num: number) {
  if (!Number.isFinite(num)) {
    throw new Error(`expected coordinates to be finite but instead saw: ${num}`);
  }
}

function assertValidCoord(coord: Coord) {
  if (isPointLike(coord)) {
    assertCoordinateFinite(coord.x);
    assertCoordinateFinite(coord.y);
  } else {
    if (coord.length !== 2) {
      throw new Error(`expected a PointLike object or an array of length 2 but instead saw ${JSON.stringify(coord)}`);
    }
    assertCoordinateFinite(coord[0]);
    assertCoordinateFinite(coord[1]);
  }
}

export function castCoordToRawPoint(coord: Coord): RawPoint {
  assertValidCoord(coord);
  if (isPointLike(coord)) {
    const { x, y } = coord;
    return { x, y };
  }
  const [x, y] = coord;
  return { x, y };
}

export function rawPointToString({ x, y }: RawPoint) {
  return `${x},${y}`;
}

export function pointLikeToTuple({ x, y }):PointTuple {
  return [x, y];
}

export function pointTupleToRawPoint([x, y]):RawPoint {
  return { x, y };
}
