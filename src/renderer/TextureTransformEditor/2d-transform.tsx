import { PointTuple } from '../DielineViewer/util/geom';

export const matrixTupleTransformPoint = (matrix: DOMMatrixReadOnly, tuple: PointTuple): PointTuple => {
  const domPoint = matrix.transformPoint(new DOMPoint(...tuple));
  return [domPoint.x, domPoint.y];
};
export const addTuple = ([ax, ay]: PointTuple, [bx, by]: PointTuple): PointTuple => [ax + bx, ay + by];

export const negateMap = (num) => num * -1;

const matrixWithTransformCenter = (origin, scale, rotation) => (new DOMMatrixReadOnly())
  .translate(...origin)
  .scale(scale, scale)
  .rotate(rotation)
  .translate(...origin.map(negateMap));
// TODO: can this calculation be siplified?
export const calculateTransformOriginChangeOffset = (
  oldTransformOrigin, newTransformOrigin,
  scale, rotation, translation,
) => {
  const newMatrix = matrixWithTransformCenter(newTransformOrigin, scale, rotation);
  const oldMatrix = matrixWithTransformCenter(oldTransformOrigin, scale, rotation);
  return addTuple(
    matrixTupleTransformPoint(newMatrix, translation),
    matrixTupleTransformPoint(oldMatrix, translation).map(negateMap),
  );
};
export const getTextureTransformMatrix = (origin, scale, rotation, translation) => (new DOMMatrixReadOnly())
  .translate(...translation)
  .multiply(matrixWithTransformCenter(origin, scale, rotation));
