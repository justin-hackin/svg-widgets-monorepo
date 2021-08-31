import { chunk, uniq } from 'lodash';
import { model, Model, prop } from 'mobx-keystone';
import { computed } from 'mobx';

// import { convertMessageToMorseBooleanString } from './morse';
// import { PHI } from '../../common/util/geom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const scoreMessage:number[] = convertMessageToMorseBooleanString('playful geometer is symmetrically excellent')
//   .reduce((acc:number[], isLong) => {
//     acc.push(isLong ? PHI ** 2 : 1 / PHI, 1);
//     return acc;
//   }, []);

const dasharrays = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 1, 1, 1]];
if (!uniq(dasharrays)) {
  throw new Error('dasharrays contents are not unique');
}

const dasharrayLabelMap = (dasharray) => chunk(dasharray, 2).map(([stroke, gap]) => `● ${stroke} ○ ${gap}`).join(' ');

export const dashPatterns = dasharrays.map((relativeStrokeDasharray) => ({
  relativeStrokeDasharray,
  $modelId: dasharrayLabelMap(relativeStrokeDasharray),
}));

@model('StrokeDashPathPatternModel')
export class StrokeDashPathPatternModel extends Model({
  // TODO: even number length typing?
  relativeStrokeDasharray: prop<number[]>(() => dasharrays[0]),
  labelOverride: prop<string | null>(() => null),
}) {
  @computed
  get label() {
    return this.labelOverride || this.$modelId;
  }
}
