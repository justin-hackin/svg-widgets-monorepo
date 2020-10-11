import { IStrokeDashPathPatternModel } from './PyramidNetStore';
import { convertMessageToMorseBooleanString } from './morse';
import { PHI } from '../../common/util/geom';

const scoreMessage:number[] = convertMessageToMorseBooleanString('playful geometer is symmetrically excellent')
  .reduce((acc:number[], isLong) => {
    acc.push(isLong ? PHI ** 2 : 1 / PHI, 1);
    return acc;
  }, []);

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
