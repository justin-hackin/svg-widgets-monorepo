import { PHI } from '../util/geom';
import { PyramidGeometrySpec } from '../components/PyramidNet';

interface PolyhedraDefs {
  [propName: string]: PyramidGeometrySpec,
}
const SQRT_TWO = Math.sqrt(2);

export const polyhedra:PolyhedraDefs = {
  'great-stellated-dodecahedron': {
    relativeFaceEdgeLengths: [PHI, 1, PHI],
    diameter: 6,
    faceCount: 3,
    copiesNeeded: 20,
  },
  'small-stellated-dodecahedron': {
    relativeFaceEdgeLengths: [PHI, 1, PHI],
    diameter: 2.75,
    faceCount: 5,
    copiesNeeded: 12,
  },
  'star-tetrahedron': {
    relativeFaceEdgeLengths: [1, 1, 1],
    diameter: 2.5,
    faceCount: 3,
    copiesNeeded: 8,
  },
  'great-dodecahedron': {
    relativeFaceEdgeLengths: [8.62839, 13.961, 8.62839],
    diameter: 26.5555,
    faceCount: 3,
    copiesNeeded: 20,
  },
  'small-triambic-icosahedron': {
    relativeFaceEdgeLengths: [7.4076, 11.7125, 7.4076],
    diameter: 23.7519,
    faceCount: 3,
    copiesNeeded: 20,
  },
  'cube-octahedron-dual-part-1': {
    relativeFaceEdgeLengths: [1, 1, 1],
    diameter: 3,
    faceCount: 4,
    copiesNeeded: 6,
  },
  'cube-octahedron-dual-part-2': {
    relativeFaceEdgeLengths: [1 / SQRT_TWO, 1, 1 / SQRT_TWO],
    diameter: 3,
    faceCount: 3,
    copiesNeeded: 8,
  },
  'small-rhombihexacron': {
    relativeFaceEdgeLengths: [14.9432, 4.78746, 16.3454],
    diameter: 39.0484,
    faceCount: 8,
    copiesNeeded: 12,
  },
  'great-rhombihexacron': {
    relativeFaceEdgeLengths: [10.4806, 6.13942, 11.7522],
    diameter: 30.7099,
    faceCount: 4,
    copiesNeeded: 12,
  },
  'small-dodecacronic-hexecontahedron': {
    relativeFaceEdgeLengths: [5.95627, 2.88405, 6.7534],
    diameter: 22.0529,
    faceCount: 10,
    copiesNeeded: 12,
  },
  'great-disdyakisdodecahedron': {
    relativeFaceEdgeLengths: [12.5898, 6.05025, 15.442],
    diameter: 36.8901,
    faceCount: 4,
    copiesNeeded: 6,
  },
  'small-icosacronic-hexecontahedron': {
    relativeFaceEdgeLengths: [5.42583, 7.0255, 9.11151],
    faceCount: 6,
    diameter: 29.872,
    copiesNeeded: 20,
  },
  rhombicosacron: {
    relativeFaceEdgeLengths: [6.79529, 7.14265, 10.6476],
    diameter: 34.7693,
    faceCount: 6,
    copiesNeeded: 12,
  },
  'great-dodecicosacron': {
    relativeFaceEdgeLengths: [10.1792, 7.88475, 14.7314],
    diameter: 45.3387,
    faceCount: 6,
    copiesNeeded: 20,
  },
  'great-stellapentakisdodecahedron': {
    relativeFaceEdgeLengths: [17.5295, 9.29021, 23.3727],
    faceCount: 6,
    diameter: 65.5024,
    copiesNeeded: 20,
  },
  // boxy and boring ...
  // tetrakishexahedron: {
  //   relativeFaceEdgeLengths: [13.3605, 17.8139, 13.3605],
  //   faceCount: 4,
  //   diameter: 30.8546,
  //   copiesNeeded: 6,
  // },
  triakisoctahedron: { // TODO: model
    relativeFaceEdgeLengths: [14.9287, 25.4848, 14.9287],
    diameter: 36.041,
    faceCount: 3,
    copiesNeeded: 8,
  },
  disdyakisdodecahedron: { // TODO: model
    relativeFaceEdgeLengths: [11.1129, 8.30741, 13.5461],
    diameter: 30.6552,
    faceCount: 8,
    copiesNeeded: 6,
  },
  pentakisdodecahedron: { // TODO: model
    relativeFaceEdgeLengths: [8.81261, 9.93465, 8.81261],
    faceCount: 5,
    diameter: 27.842,
    copiesNeeded: 12,
  },
  disdyakistriacontahedron: { // TODO: model
    relativeFaceEdgeLengths: [7.64795, 4.86876, 8.99365],
    diameter: 28.8374,
    faceCount: 10,
    copiesNeeded: 12,
  },

};
