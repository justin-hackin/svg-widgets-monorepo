import { Instance, types } from 'mobx-state-tree';
// @ts-ignore
import { Polygon, point } from '@flatten-js/core';

import { closedPolygonPath } from '../../DielineViewer/util/shapes/generic';
import { PointTuple } from '../../common/util/geom';

const frozenPoint = types.frozen<PointTuple>();
export const BoundaryModel = types.model({
  faceVertices: types.frozen(types.array(frozenPoint)),
}).views((self) => ({
  get viewBoxAttrs() {
    const poly = new Polygon();
    poly.addFace(self.faceVertices.map((vert) => point(...vert)));
    const {
      xmin, ymin, xmax, ymax,
    } = poly.box;
    return {
      xmin, ymin, width: xmax - xmin, height: ymax - ymin,
    };
  },
  get pathD() {
    return closedPolygonPath(self.faceVertices).getD();
  },
}));

export interface IBoundaryModel extends Instance<typeof BoundaryModel> {}
