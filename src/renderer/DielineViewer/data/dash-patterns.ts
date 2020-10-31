import { Instance, types } from 'mobx-state-tree';
import { chunk, uniq } from 'lodash';

import { convertMessageToMorseBooleanString } from './morse';
import { PHI } from '../../common/util/geom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const scoreMessage:number[] = convertMessageToMorseBooleanString('playful geometer is symmetrically excellent')
  .reduce((acc:number[], isLong) => {
    acc.push(isLong ? PHI ** 2 : 1 / PHI, 1);
    return acc;
  }, []);

const dasharrayLabelMap = (dasharray) => chunk(dasharray, 2).map(([stroke, gap]) => `● ${stroke} ○ ${gap}`).join(' ');

export const StrokeDashPathPatternModel = types.model({
  id: types.identifier,
  relativeStrokeDasharray: types.frozen(),
  labelOverride: types.maybe(types.string),
}).views((self) => ({
  get label() {
    return self.labelOverride || self.id;
  },
}));

export interface IStrokeDashPathPatternModel extends Instance<typeof StrokeDashPathPatternModel> {}

export const DashPatternsModel = types.array(StrokeDashPathPatternModel);

const dasharrays = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 1, 1, 1]];
if (!uniq(dasharrays)) {
  throw new Error('dasharrays contents are not unique');
}

export const dashPatterns = DashPatternsModel.create(
  dasharrays.map((relativeStrokeDasharray) => ({
    relativeStrokeDasharray,
    id: dasharrayLabelMap(relativeStrokeDasharray),
  })),
);
