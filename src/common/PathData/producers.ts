import { Producer } from 'immer/src/types/types-external';
import { reverse } from 'lodash-es';
import { composeSVG, parseSVG } from '@/common/PathData/helpers';
import { produce } from 'immer';
import { ImmutableCommandArray } from '@/common/PathData/types';
import SVGPathCommander, { TransformObject } from 'svg-path-commander';

// Producer is a confusing type name, Recipe would have been better,
// (https://github.com/immerjs/immer/pull/968/files)
// hence prefixing with Recipe and Producer (curried produce return value)
export const emptyArrayRecipe: Producer<ImmutableCommandArray> = ((commands) => {
  commands.splice(0, commands.length);
});

export const reversePathRecipe: Producer<ImmutableCommandArray> = ((commands) => {
  emptyArrayRecipe(commands);
  commands.concat(parseSVG(reverse(composeSVG(commands))));
});

export const transformProducer = produce<ImmutableCommandArray, [Partial<TransformObject>]>(
  (commands, matrix) => parseSVG(
    (new SVGPathCommander(composeSVG(commands))).transform({ origin: [0, 0, 0], ...matrix }).toString(),
  ),
);
