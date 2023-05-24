import { Producer } from 'immer/src/types/types-external';
import { produce } from 'immer';
import SVGPathCommander, { TransformObject } from 'svg-path-commander';
import { commandArrayToPathD, pathDToCommandArray, segmentsToCommandArray } from './helpers';
import { Command, ImmutableCommandArray, RawPoint } from './types';

// Producer is a confusing type name, Recipe would have been better,
// (https://github.com/immerjs/immer/pull/968/files)
// hence prefixing with Recipe and Producer (curried produce return value)

export const reversePathRecipe: Producer<ImmutableCommandArray> = ((commands) => segmentsToCommandArray(
  SVGPathCommander.reversePath(SVGPathCommander.parsePathString(commandArrayToPathD(commands))),
));

export const transformByObjectProducer = produce<ImmutableCommandArray, [Partial<TransformObject>]>(
  (commands, transformObj) => pathDToCommandArray(
    // the library has an odd convention regarding origin as center of the document
    (new SVGPathCommander(commandArrayToPathD(commands))).transform({ origin: [0, 0], ...transformObj }).toString(),
  ),
);

function mapTransform(point: RawPoint, matrix: DOMMatrixReadOnly) {
  const domPoint = matrix.transformPoint(new DOMPoint(point.x, point.y));
  return { x: domPoint.x, y: domPoint.y };
}
export function boolToFlag(bool: boolean) {
  return bool ? 1 : 0;
}

function transformCommand(command: Command, matrix: DOMMatrixReadOnly) {
  const pointProps = Object.keys(command).filter((prop) => ['to', 'ctrl1', 'ctrl2'].includes(prop));

  for (const key of pointProps) {
    // @ts-ignore
    command[key] = mapTransform(command[key], matrix);
  }
}

export const transformByMatrixProducer = produce<ImmutableCommandArray, [DOMMatrixReadOnly]>(
  (commands, matrix) => {
    commands.forEach((command) => transformCommand(command, matrix));
  },
);
