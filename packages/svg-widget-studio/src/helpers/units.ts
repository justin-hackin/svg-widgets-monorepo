import parseFraction from 'parse-fraction';
import gcd from 'gcd';

export enum UNITS {
  cm = 'cm', in = 'in',
}

const INCHES_TO_CM_RATIO = 1.0 / 2.54;
export const PIXELS_PER_INCH = 96;
export const PIXELS_PER_CM = INCHES_TO_CM_RATIO * PIXELS_PER_INCH;
export const PIXELS_PER_UNIT = {
  [UNITS.cm]: PIXELS_PER_CM,
  [UNITS.in]: PIXELS_PER_INCH,
};
const IN_DENOMINATOR = 64;
export const UNIT_STEP = {
  [UNITS.cm]: PIXELS_PER_CM * 0.1,
  [UNITS.in]: (1.0 / IN_DENOMINATOR) * PIXELS_PER_INCH,
};

export type Fraction = [number, number];
const MAX_INCHES_DENOMINATOR = 64;

export const reduceInchesFraction = (fraction: Fraction, maxDenom: number = MAX_INCHES_DENOMINATOR): Fraction => {
  const decimalNum = fraction[0] / fraction[1];
  const numerOfMaxDenom = Math.round(decimalNum * maxDenom);
  const gcdVal = gcd(numerOfMaxDenom, maxDenom);
  return [numerOfMaxDenom / gcdVal, maxDenom / gcdVal];
};

const fractionToWholeNumberWithRemainderString = ([num, denom]: Fraction) => {
  const wholeUnits = Math.floor(num / denom);
  const remainderNum = num - (wholeUnits * denom);
  if (wholeUnits === 0 && remainderNum === 0) {
    return '0';
  }
  const fractionStr = remainderNum ? ` ${remainderNum}/${denom}` : '';
  return `${wholeUnits || ''}${fractionStr}`;
};

export const UNIT_LABEL_FORMAT = {
  [UNITS.cm]: (unitNumber: number) => `${unitNumber.toFixed(3)} cm`,
  [UNITS.in]: (fract: Fraction) => `${fractionToWholeNumberWithRemainderString(fract)}"`,
};

export const getFractionOrNull = (numString: string) => {
  try {
    const parsedFraction = parseFraction(numString) as Fraction;
    // this library doesn't throw for a zero-denominator
    if (parsedFraction[1] === 0) {
      return null;
    }
    return parsedFraction;
  } catch (_) {
    return null;
  }
};

export const pxToUnitView = (val: number, unit: UNITS) => {
  if (unit === UNITS.in) {
    const maybeFraction = getFractionOrNull((val / PIXELS_PER_UNIT[unit]).toString());
    if (maybeFraction === null) {
      throw new Error('could not parse number value to ');
    }
    const reducedFraction = reduceInchesFraction(maybeFraction);
    return UNIT_LABEL_FORMAT[UNITS.in](reducedFraction);
  }
  return UNIT_LABEL_FORMAT[UNITS.cm](val / PIXELS_PER_UNIT[unit]);
};
