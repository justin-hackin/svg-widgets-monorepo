import {
  Coord, PointLike, PointTuple, RawPoint,
} from './types';

/**
 * Type discriminator, true if PointLike, otherwise PointTuple
 * @param coord
 */
export function isPointLike(coord: Coord): coord is PointLike {
  return Number.isFinite((coord as PointLike).x) && Number.isFinite((coord as PointLike).y);
}

/**
 * Throws error if number is not finite
 * @param num
 */
export function assertCoordinateFinite(num: number) {
  if (!Number.isFinite(num)) {
    throw new Error(`expected coordinates to be finite but instead saw: ${num}`);
  }
}

/**
 * Throws error if number is not finite
 * @param coord
 */
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

/**
 *
 * @param coord
 * @returns a POJO with x & y of coordinate
 */
export function castCoordToRawPoint(coord: Coord): RawPoint {
  assertValidCoord(coord);
  if (isPointLike(coord)) {
    const { x, y } = coord;
    return { x, y };
  }
  const [x, y] = coord;
  return { x, y };
}

/**
 *
 * @returns comma-delimited point as in path strings
 */
export function rawPointToString({ x, y }: RawPoint) {
  return `${x},${y}`;
}

export function pointLikeToTuple({ x, y }: PointLike):PointTuple {
  return [x, y];
}

export function pointTupleToRawPoint([x, y]: PointTuple):RawPoint {
  return { x, y };
}
