import { getParent, Model, model } from 'mobx-keystone';
import { isInteger, sortBy, startCase } from 'lodash-es';
import { radioProp, selectProp } from 'svg-widget-studio';
import { polyhedra } from '../polyhedra';

const getDivisors = (num) => {
  if (!isInteger(num)) {
    throw new Error(`getDivisors expects integer as parameter but received: ${num}`);
  }
  // yes there are more efficient algorithms but input num unlikely to be a large number here
  // package integer-divisors emits regeneratorRuntime errors
  const divisors: number[] = [];
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
    options: sortBy(Object.keys(polyhedra)),
    optionLabelMap: (option: string) => startCase(option),
    // .map((shapeId) => ({ value: shapeId, label: startCase(shapeId) })),
  }),
  netsPerPyramid: radioProp(1, {
    isRow: true,
    options: (self) => (getParent(self).netsPerPyramidOptions as number[]),
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
    return getDivisors(this.faceIsSymmetrical ? this.geometry.faceCount : this.geometry.faceCount / 2);
  }

  get facesPerNet() {
    return this.geometry.faceCount / this.netsPerPyramid.value;
  }

  get copiesNeeded() {
    return this.geometry.pyramidsPerShape * this.netsPerPyramid.value;
  }
}
