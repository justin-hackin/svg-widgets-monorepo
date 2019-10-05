import { Vector } from '@flatten-js/core';

import React from 'react';
import { PolygonPath } from './PolygonPath';

// eslint-disable-next-line func-names
Vector.prototype.toArray = function () { return [this.x, this.y]; };
Vector.prototype.angleOfDifference = function (p) { return p.subtract(this).slope; };
Vector.fromAngle = (angle, length) => new Vector(length, 0).rotate(angle);

const polarLineExtension = (p1, p2, theta, length) => Vector.fromAngle(
  p2.angleOfDifference(p1) + theta, length,
).add(p2);

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
  const p2 = p1.add(new Vector(faceEdgeLengths[0], 0));

  const range = (length) => Array.from({ length }, (_, i) => i);

  const v1 = Vector.fromAngle(Math.PI - faceInteriorAngles[0], faceEdgeLengths[1]);

  v1.y *= -1;
  const p3 = p2.add(v1);
  const boundaryPoints = [p1.toArray(), p2.toArray(), p3.toArray()];
  const p4 = polarLineExtension(new Vector(0, 0), p2, 0.4 + Math.PI / 2, 400);

  return (
    <g>
      <symbol id="tile" overflow="visible">
        <g>
          <PolygonPath fill="none" stroke="#000" points={boundaryPoints} />
          <line
            stroke="#2ECC71"
            {...{
              x1: p2.x, y1: p2.y, x2: p4.x, y2: p4.y,
            }}
          />
        </g>
      </symbol>
      {range(faceCount).map((index) => (
        <use
          key={index}
          transform={`rotate(${(index * faceInteriorAngles[2] * 360) / (2 * Math.PI)})`}
          xlinkHref="#tile"
        />
      ))}
    </g>
  );
};
