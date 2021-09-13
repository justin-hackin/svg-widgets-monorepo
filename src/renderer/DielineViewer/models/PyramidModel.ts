import { getParent, Model, model } from 'mobx-keystone';
import { isInteger, sortBy, startCase } from 'lodash';
import { polyhedra } from '../data/polyhedra';
import { selectProp } from '../../../common/keystone-tweakables/props';

const getDivisors = (num) => {
  if (!isInteger(num)) {
    throw new Error(`getDivisors expects integer as parameter but received: ${num}`);
  }
  // yes there are more efficient algorithms but input num unlikely to be a large number here
  // package integer-divisors emits regeneratorRuntime errors
  const divisors = [];
  // eslint-disable-next-line for-direction
  for (let div = num; div >= 1; div -= 1) {
    if (isInteger(num / div)) {
      divisors.push(div);
    }
  }
  return divisors;
};

@model('PyramidModel')
export class PyramidModel extends Model({
  shapeName: selectProp('small-triambic-icosahedron', {
    labelOverride: 'Polyhedron',
    options: sortBy(Object.keys(polyhedra))
      .map((shapeId) => ({ value: shapeId, label: startCase(shapeId) })),
  }),
  netsPerPyramid: selectProp(1, {
    // can't use type PyramidModel because of TS2310 (but it's better than using hard-coded paths)
    // context: https://github.com/microsoft/TypeScript/issues/40315
    options: (_, self) => () => (getParent(self).netsPerPyramidOptions as number[])
      .map((value) => ({ value, label: value.toString() })),
  }),
}) {
  get geometry() {
    return polyhedra[this.shapeName.value];
  }

  get faceIsSymmetrical() {
    return this.geometry.uniqueFaceEdgeLengths.length < 3;
  }

  // allows multiple nets to build a single pyramid e.g. one face per net
  get netsPerPyramidOptions(): number[] {
    // TODO: re-enable this as integer divisors of face count, integer-divisor npm emits regeneratorRuntime errors
    return getDivisors(this.faceIsSymmetrical ? this.geometry.faceCount : this.geometry.faceCount / 2 );
  }

  get facesPerNet() {
    return this.geometry.faceCount / this.netsPerPyramid.value;
  }
}
