import { PHI } from '../../../common/util/geom';

export interface PyramidGeometrySpec {
  // if there are only 2 lengths then this triangle is symmetric and the third side is equal to the first side
  // if there is only 1 length then the triangle is equilateral
  // this makes the derived property isSymmetricFace immune from human error due to non-DRY face definition
  uniqueFaceEdgeLengths: [number] | [number, number, number] | [number, number],
  diameter: number,
  faceCount: number,
  copiesNeeded: number,
}

interface PolyhedraDefs {
  [propName: string]: PyramidGeometrySpec,
}

export const polyhedra:PolyhedraDefs = {
  'great-stellated-dodecahedron': {
    uniqueFaceEdgeLengths: [PHI, 1],
    diameter: 6,
    faceCount: 3,
    copiesNeeded: 20,
  },
  'small-stellated-dodecahedron': {
    uniqueFaceEdgeLengths: [PHI, 1],
    diameter: 2.75,
    faceCount: 5,
    copiesNeeded: 12,
  },
  'star-tetrahedron': {
    uniqueFaceEdgeLengths: [1],
    diameter: 2.5,
    faceCount: 3,
    copiesNeeded: 8,
  },
  'great-dodecahedron': {
    uniqueFaceEdgeLengths: [8.62839, 13.961],
    diameter: 26.5555,
    faceCount: 3,
    copiesNeeded: 20,
  },
  'small-triambic-icosahedron': {
    uniqueFaceEdgeLengths: [7.4076, 11.7125],
    diameter: 23.7519,
    faceCount: 3,
    copiesNeeded: 20,
  },
  // 'cube-octahedron-dual-part-1': {
  //   uniqueFaceEdgeLengths: [1, 1, 1],
  //   diameter: 3,
  //   faceCount: 4,
  //   copiesNeeded: 6,
  // },
  // 'cube-octahedron-dual-part-2': {
  //   uniqueFaceEdgeLengths: [1 / SQRT_TWO, 1, 1 / SQRT_TWO],
  //   diameter: 3,
  //   faceCount: 3,
  //   copiesNeeded: 8,
  // },
  'small-rhombihexacron': {
    uniqueFaceEdgeLengths: [14.9432, 4.78746, 16.3454],
    diameter: 39.0484,
    faceCount: 8,
    copiesNeeded: 12,
  },
  'great-rhombihexacron': {
    uniqueFaceEdgeLengths: [10.4806, 6.13942, 11.7522],
    diameter: 30.7099,
    faceCount: 4,
    copiesNeeded: 12,
  },
  'small-dodecacronic-hexecontahedron': {
    uniqueFaceEdgeLengths: [5.95627, 2.88405, 6.7534],
    diameter: 22.0529,
    faceCount: 10,
    copiesNeeded: 12,
  },
  'great-disdyakis-dodecahedron': {
    uniqueFaceEdgeLengths: [12.5898, 6.05025, 15.442],
    diameter: 36.8901,
    faceCount: 6,
    copiesNeeded: 8,
  },
  'small-icosacronic-hexecontahedron': {
    uniqueFaceEdgeLengths: [5.42583, 7.0255, 9.11151],
    faceCount: 6,
    diameter: 29.872,
    copiesNeeded: 20,
  },
  rhombicosacron: {
    uniqueFaceEdgeLengths: [6.79529, 7.14265, 10.6476],
    diameter: 34.7693,
    faceCount: 6,
    copiesNeeded: 12,
  },
  'great-dodecicosacron': {
    uniqueFaceEdgeLengths: [10.1792, 7.88475, 14.7314],
    diameter: 45.3387,
    faceCount: 6,
    copiesNeeded: 20,
  },
  'great-stellapentakis-dodecahedron': {
    uniqueFaceEdgeLengths: [17.5295, 9.29021, 23.3727],
    faceCount: 6,
    diameter: 65.5024,
    copiesNeeded: 20,
  },
  // boxy and boring ...
  // tetrakishexahedron: {
  //   uniqueFaceEdgeLengths: [13.3605, 17.8139, 13.3605],
  //   faceCount: 4,
  //   diameter: 30.8546,
  //   copiesNeeded: 6,
  // },
  'triakis-octahedron': {
    uniqueFaceEdgeLengths: [14.9287, 25.4848],
    diameter: 36.041,
    faceCount: 3,
    copiesNeeded: 8,
  },
  'disdyakis-dodecahedron': {
    uniqueFaceEdgeLengths: [3.13, 5.1, 4.18],
    diameter: 11.5,
    faceCount: 4,
    copiesNeeded: 6,
  },
  'pentakis-dodecahedron': {
    uniqueFaceEdgeLengths: [3.32, 3.74],
    diameter: 9.79,
    faceCount: 5,
    copiesNeeded: 12,
  },
  // too tight
  // 'disdyakis-triacontahedron': {
  //   uniqueFaceEdgeLengths: [1.83, 3.39, 2.88],
  //   diameter: 28.8374,
  //   faceCount: 4,
  //   copiesNeeded: 30,
  // },
  '5-octahedra-compound': {
    uniqueFaceEdgeLengths: [1.95, 2.42, 2.7],
    diameter: 10,
    faceCount: 4,
    copiesNeeded: 30,
  },
  // 'strombic-icositetrahedorn': {
  //   uniqueFaceEdgeLengths: [3.87, 2.99, 2.99, 2.87],
  //   diameter: 10.1,
  //   faceCount: 1,
  //   copiesNeeded: 24,
  // },
};
