import { getBoundingBoxAttrs } from '../../../../../../../common/util/svg';
import { getLineLineIntersection, lineLerp } from '../../../../../../../common/util/geom';
import { closedPolygonPath } from '../../../../../../../common/shapes/generic';

export class BoundaryModel {
  constructor(readonly vertices) {}

  get boundingBoxAttrs() {
    return getBoundingBoxAttrs(this.pathD);
  }

  get pathD() {
    return closedPolygonPath(this.vertices).getD();
  }

  get centerPoint() {
    const mid1 = lineLerp(this.vertices[0], this.vertices[1], 0.5);
    const mid2 = lineLerp(this.vertices[1], this.vertices[2], 0.5);

    return getLineLineIntersection(this.vertices[0], mid2, this.vertices[2], mid1);
  }
}
