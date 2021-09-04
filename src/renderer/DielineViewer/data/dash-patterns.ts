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
