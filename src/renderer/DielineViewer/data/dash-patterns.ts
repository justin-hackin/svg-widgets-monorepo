import { Instance, types } from 'mobx-state-tree';
import { convertMessageToMorseBooleanString } from './morse';
import { PHI } from '../../common/util/geom';

const scoreMessage:number[] = convertMessageToMorseBooleanString('playful geometer is symmetrically excellent')
  .reduce((acc:number[], isLong) => {
    acc.push(isLong ? PHI ** 2 : 1 / PHI, 1);
    return acc;
  }, []);

const StrokeDashPathPatternModel = types.model({
  relativeStrokeDasharray: types.frozen(),
  label: types.string,
});

export interface IStrokeDashPathPatternModel extends Instance<typeof StrokeDashPathPatternModel> {
}

interface DashPatterns {
  [key: string]: IStrokeDashPathPatternModel,
}

export const dashPatterns:DashPatterns = {
  base: {
    relativeStrokeDasharray: [2, 1],
    label: 'Base',
  },
  interface: {
    relativeStrokeDasharray: scoreMessage,
    label: 'playful geometer is symmetrically excellent',
  },
};
