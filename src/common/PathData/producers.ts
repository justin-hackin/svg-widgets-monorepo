import { Producer } from 'immer/src/types/types-external';
import { reverse } from 'lodash-es';
import { composeSVG, parseSVG } from '@/common/PathData/helpers';
import svgpath from 'svgpath';
import { produce } from 'immer';
import { ImmutableCommandArray } from '@/common/PathData/types';

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

export const transformProducer = produce<ImmutableCommandArray, [string]>(
  (commands, matrix) => parseSVG(svgpath(composeSVG(commands))
    .transform(matrix).toString()),
);
