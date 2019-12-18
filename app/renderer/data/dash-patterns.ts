import { convertMessageToMorseBooleanString } from './morse';
import { PHI } from '../util/geom';

const scoreMessage = convertMessageToMorseBooleanString('playful geometer is symmetrically excellent')
  .reduce((acc, isLong) => {
    acc.push(isLong ? PHI ** 2 : 1 / PHI, 1);
    return acc;
  }, []);

export const dashPatterns = {
  base: {
    relativeStrokeDasharray: [2, 1],
    label: 'Base',
  },
  interface: {
    relativeStrokeDasharray: scoreMessage,
    label: 'playful geometer is symmetrically excellent',
  },
};
