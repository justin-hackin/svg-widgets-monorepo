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
    copiesNeeded: 20,
  },
  'small-stellated-dodecahedron': {
    relativeFaceEdgeLengths: [PHI, 1, PHI],
    faceCount: 5,
    firstEdgeLengthToShapeHeight: 2.2,
    copiesNeeded: 12,
  },
  'star-tetrahedron': {
    relativeFaceEdgeLengths: [1, 1, 1],
    faceCount: 3,
    firstEdgeLengthToShapeHeight: 3,
    copiesNeeded: 8,
  },
  'earth-grid': {
    relativeFaceEdgeLengths: [275.38, 446.97, 406.09],
    faceCount: 4,
    firstEdgeLengthToShapeHeight: 5,
    copiesNeeded: 30,
  },
  'great-dodecahedron': {
    relativeFaceEdgeLengths: [1 / PHI, 1, 1 / PHI],
    faceCount: 3,
    firstEdgeLengthToShapeHeight: 4,
    copiesNeeded: 20,
  },
  'small-triambic-icosahedron': {
    relativeFaceEdgeLengths: [7.4076, 11.7125, 7.4076],
    faceCount: 3,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 20,
  },
  'cube-octahedron-dual-part-1':{
    relativeFaceEdgeLengths: [1, 1, 1],
    faceCount: 4,
    // TODO: problem with connecting shapes based on firstEdgeLengthToShapeHeight
    firstEdgeLengthToShapeHeight: 4,
    copiesNeeded: 6,
  },
  'cube-octahedron-dual-part-2': {
    relativeFaceEdgeLengths: [1, Math.sqrt(2), 1],
    faceCount: 3,
    // TODO: problem with connecting shapes based on firstEdgeLengthToShapeHeight
    firstEdgeLengthToShapeHeight: 4,
    copiesNeeded: 8,
  },
  'small-rhombihexacron': {
    relativeFaceEdgeLengths: [14.9432, 4.78746, 16.3454],
    faceCount: 8,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 12,
  },
  'great-rhombihexacron': {
    relativeFaceEdgeLengths: [10.4806, 6.13942, 11.7522],
    faceCount: 4,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 12,
  },
  'small-dodecacronic-hexecontahedron': {
    relativeFaceEdgeLengths: [5.95627, 2.88405, 6.7534],
    faceCount: 10,
    firstEdgeLengthToShapeHeight: 1.75,
    copiesNeeded: 12,
  },
  'great-disdyakisdodecahedron': {
    relativeFaceEdgeLengths: [12.5898, 6.05025, 15.442],
    faceCount: 4,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 6,
  },
  rhombicosacron: {
    relativeFaceEdgeLengths: [6.79529, 7.14265, 10.6476],
    faceCount: 6,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 12,
  },
  'great-dodecicosacron': {
    relativeFaceEdgeLengths: [10.1792, 7.88475, 14.7314],
    faceCount: 6,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 20,
  },
  'great-stellapentakisdodecahedron': {
    relativeFaceEdgeLengths: [17.5295, 9.29021, 23.3727],
    faceCount: 6,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 20,
  },
  'small-icosacronic-hexecontahedron': {
    relativeFaceEdgeLengths: [5.42583, 7.0255, 9.11151],
    faceCount: 6,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 20,
  },
  tetrakishexahedron: {
    relativeFaceEdgeLengths: [13.3605, 17.8139, 13.3605],
    faceCount: 4,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 6,
  },
  triakisoctahedron: {
    relativeFaceEdgeLengths: [14.9287, 25.4848, 14.9287],
    faceCount: 3,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 8,
  },
  disdyakisdodecahedron: {
    relativeFaceEdgeLengths: [11.1129, 8.30741, 13.5461],
    faceCount: 8,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 6,
  },
  pentakisdodecahedron: {
    relativeFaceEdgeLengths: [8.81261, 9.93465, 8.81261],
    faceCount: 5,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 12,
  },
  disdyakistriacontahedron: {
    relativeFaceEdgeLengths: [7.64795, 4.86876, 8.99365],
    faceCount: 10,
    firstEdgeLengthToShapeHeight: 2.5,
    copiesNeeded: 12,
  },

};
