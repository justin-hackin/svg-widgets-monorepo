import { Instance, types } from 'mobx-state-tree';

import { closedPolygonPath } from '../../../../renderer/DielineViewer/util/shapes/generic';
import { RawPoint } from '../../../util/geom';
import { boundingViewBoxAttrs } from '../../../util/svg';

const frozenPoint = types.frozen<RawPoint>();
export const BoundaryModel = types.model({
  vertices: types.frozen(types.array(frozenPoint)),
}).views((self) => ({
  get viewBoxAttrs() {
    return boundingViewBoxAttrs(this.pathD);
  },
  get pathD() {
    return closedPolygonPath(self.vertices).getD();
  },
}));

export interface IBoundaryModel extends Instance<typeof BoundaryModel> {}
