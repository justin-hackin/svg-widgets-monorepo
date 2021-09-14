import { PHI } from '../../../common/util/geom';

interface CharCodeBool {
  [key: string]: boolean[]
}
const charCodeBool:CharCodeBool = {
  0: [true, true, true, true, true],
  1: [false, true, true, true, true],
  2: [false, false, true, true, true],
  3: [false, false, false, true, true],
  4: [false, false, false, false, true],
  5: [false, false, false, false, false],
  6: [true, false, false, false, false],
  7: [true, true, false, false, false],
  8: [true, true, true, false, false],
  9: [true, true, true, true, false],
  a: [false, true],
  b: [true, false, false, false],
  c: [true, false, true, false],
  d: [true, false, false],
  e: [false],
  f: [false, false, true, false],
  g: [true, true, false],
  h: [false, false, false, false],
  i: [false, false],
  j: [false, true, true, true],
  k: [true, false, true],
  l: [false, true, false, false],
  m: [true, true],
  n: [true, false],
  o: [true, true, true],
  p: [false, true, true, false],
  q: [true, true, false, true],
  r: [false, true, false],
  s: [false, false, false],
  t: [true],
  u: [false, false, true],
  v: [false, false, false, true],
  w: [false, true, true],
  x: [true, false, false, true],
  y: [true, false, true, true],
  z: [true, true, false, false],
};

export const convertMessageToMorseBooleanString = (message):boolean[] => {
  const booleanMessage:boolean[] = [];
  for (const char of message.toLowerCase().replace(/\s/g, '')) {
    if (!charCodeBool[char]) {
      throw new Error('message contains invalid characters, use only alphanumeric characters and spaces (stripped)');
    }
    booleanMessage.push(...charCodeBool[char]);
  }
  return booleanMessage;
};

export const scoreMessage:number[] = convertMessageToMorseBooleanString('playful geometer is symmetrically excellent')
  .reduce((acc:number[], isLong) => {
    acc.push(isLong ? PHI ** 2 : 1 / PHI, 1);
    return acc;
  }, []);
