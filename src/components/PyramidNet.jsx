import React from 'react';
import Vector from 'vec2';

import { PolygonPath } from './PolygonPath';

const polarToCartesian = ([theta, length]) => [Math.cos(theta) * length, Math.sin(theta) * length];

const circularSlice = (array, start, elements) => {
  const slice = [];
  for (let i = 0; i < elements; i += 1) {
    slice.push(array[(start + i) % array.length]);
  }
  return slice;
};

const triangleAnglesGivenSides = (sideLengths) => {
  if (sideLengths.length !== 3) {
    throw new Error('triangleAnglesGivenSides: parameter sideLengths must be array of length 3');
  }
  return sideLengths.map((length, index, lengths) => {
    const [a, b, c] = circularSlice(lengths, index, 3);
    return Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
  });
};

export const PyramidNet = ({ netSpec }) => {
  const { faceEdgeLengths, faceCount } = netSpec;
  const faceInteriorAngles = triangleAnglesGivenSides(faceEdgeLengths);

  const p1 = new Vector(0, 0);
  const p2 = p1.add([faceEdgeLengths[0], 0], true);

  const range = (length) => Array.from({ length }, (_, i) => i);

  const v1 = new Vector(...polarToCartesian([Math.PI - faceInteriorAngles[0], faceEdgeLengths[1]]));
  v1.y *= -1;
  const p3 = p2.add(v1, true);
  const triangleHeight = -1 * p3.y;
  const points = [p1.toArray(), p2.toArray(), p3.toArray()];
  // eslint-disable-next-line no-console
  console.log(points);
  return (
    <g>
      <symbol id="tile">
        <PolygonPath transform={`translate(0, ${triangleHeight})`} fill="none" stroke="#000" points={points} />
      </symbol>
      {range(faceCount).map((index) => (
        <use
          key={index}
          transform={
            `translate(0, ${triangleHeight}) rotate(${(index * faceInteriorAngles[2] * 360) / (2 * Math.PI)
            }) translate(0, ${-triangleHeight})`
          }
          xlinkHref="#tile"
        />
      ))}
    </g>
  );
};
