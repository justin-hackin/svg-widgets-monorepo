import { PHI } from '../util/geom';
import { PyramidGeometrySpec } from '../components/PyramidNet';

interface PolyhedraDefs {
  [propName: string]: PyramidGeometrySpec,
}

export const polyhedra:PolyhedraDefs = {
  'great-stellated-dodecahedron': {
    relativeFaceEdgeLengths: [PHI, 1, PHI],
    faceCount: 3,
    firstEdgeLengthToShapeHeight: 2.2,
  },
  'small-stellated-dodecahedron': {
    relativeFaceEdgeLengths: [PHI, 1, PHI],
    faceCount: 5,
    firstEdgeLengthToShapeHeight: 2.2,
  },
  'earth-grid': {
    relativeFaceEdgeLengths: [275.38, 446.97, 406.09],
    faceCount: 4,
    firstEdgeLengthToShapeHeight: 5,
  },
  icosphere: {
    relativeFaceEdgeLengths: [1 / PHI, 1, 1 / PHI],
    faceCount: 3,
    firstEdgeLengthToShapeHeight: 4,
  },
};
