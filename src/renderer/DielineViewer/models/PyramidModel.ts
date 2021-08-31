import { Model, model, prop } from 'mobx-keystone';
import { isInteger } from 'lodash';
import { polyhedra } from '../data/polyhedra';

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
  shapeName: prop('small-triambic-icosahedron'),
  netsPerPyramid: prop(1),
}) {
  get geometry() {
    return polyhedra[this.shapeName];
  }

  get faceIsSymmetrical() {
    return this.geometry.uniqueFaceEdgeLengths.length < 3;
  }

  // allows multiple nets to build a single pyramid e.g. one face per net
  get netsPerPyramidOptions() {
    // TODO: re-enable this as integer divisors of face count, integer-divisor npm emits regeneratorRuntime errors
    return getDivisors(this.geometry.faceCount)
      // can't apply ascendant edge tabs to an odd number of faces because male & female edge lengths not equal
      .filter((divisor) => this.faceIsSymmetrical || (divisor % 2 !== 0 || divisor === 1));
  }

  get facesPerNet() {
    return this.geometry.faceCount / this.netsPerPyramid;
  }
}
