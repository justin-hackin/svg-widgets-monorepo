import React from 'react';

const pointCommand = (command, point) => `${command}${point[0]},${point[1]}`;
const pointsToPolygonCommands = (points) => points.map(
  (point, index) => pointCommand(index ? 'L' : 'M', point),
);

const closedPolygonDefinition = (points) => `${pointsToPolygonCommands(points).join(' ')} Z`;

// eslint-disable-next-line react/prop-types
export const PolygonPath = ({ points, ...rest }) => (<path {...rest} d={closedPolygonDefinition(points)} />);
