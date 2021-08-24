import { Instance, types } from 'mobx-state-tree';

import { closedPolygonPath } from '../../../../renderer/DielineViewer/util/shapes/generic';
import { getLineLineIntersection, lineLerp, RawPoint } from '../../../util/geom';
import { getBoundingBoxAttrs } from '../../../util/svg';

const frozenPoint = types.frozen<RawPoint>();
export const BoundaryModel = types.model({
  vertices: types.frozen(types.array(frozenPoint)),
}).views((self) => ({
  get boundingBoxAttrs() {
    return getBoundingBoxAttrs(this.pathD);
  },
  get pathD() {
    return closedPolygonPath(self.vertices).getD();
  },
  get centerPoint() {
    const mid1 = lineLerp(self.vertices[0], self.vertices[1], 0.5);
    const mid2 = lineLerp(self.vertices[1], self.vertices[2], 0.5);

    return getLineLineIntersection(self.vertices[0], mid2, self.vertices[2], mid1);
  },
}));

export interface IBoundaryModel extends Instance<typeof BoundaryModel> {}
