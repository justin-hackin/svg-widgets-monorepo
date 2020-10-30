import { Instance, types } from 'mobx-state-tree';

import { closedPolygonPath } from '../../DielineViewer/util/shapes/generic';
import { PointTuple } from '../../common/util/geom';
import { pathDToViewBoxAttrs } from '../../../common/util/svg';

const frozenPoint = types.frozen<PointTuple>();
export const BoundaryModel = types.model({
  vertices: types.frozen(types.array(frozenPoint)),
}).views((self) => ({
  get viewBoxAttrs() {
    return pathDToViewBoxAttrs(this.pathD);
  },
  get pathD() {
    return closedPolygonPath(self.vertices).getD();
  },
}));

export interface IBoundaryModel extends Instance<typeof BoundaryModel> {}
