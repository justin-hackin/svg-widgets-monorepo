// eslint-disable-next-line import/no-extraneous-dependencies
const { Photon } = require('@generated/photon');
const { entries, startCase } = require('lodash');
const polyhedra = require('./src/renderer/die-line-viewer/data/polyhedra.json');

const photon = new Photon();

// A `main` function so that we can use async/await
async function main() {
  for (const [shapeKey, shapeData] of entries(polyhedra)) {
    const { relativeFaceEdgeLengths, ...restShapeData } = shapeData;
    // eslint-disable-next-line no-await-in-loop
    await photon.pyramidGeometrySpecs.create({
      data: {
        name: startCase(shapeKey),
        relativeFaceEdgeLengths: {
          set: relativeFaceEdgeLengths,
        },
        ...restShapeData,
      },
    });
  }
}

main()
  // @ts-ignore
  .catch((e) => console.error(e)).finally(async () => { // eslint-disable-line no-console
    await photon.disconnect();
  });
