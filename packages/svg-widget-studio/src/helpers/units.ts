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
export const UNIT_LABEL_FORMAT = {
  [UNITS.cm]: (val) => `${(val / PIXELS_PER_UNIT[UNITS.cm]).toFixed(3)} cm`,
  [UNITS.in]: (val) => {
    const unitVal = val / PIXELS_PER_UNIT[UNITS.in];
    const abs = Math.floor(unitVal);
    const absStr = abs ? `${abs}` : '';
    const remainder = unitVal - abs;
    const numerator = Math.round(remainder * IN_DENOMINATOR);
    const gcdVal = gcd(numerator, IN_DENOMINATOR);
    const fractionStr = numerator ? ` ${numerator / gcdVal}/${IN_DENOMINATOR / gcdVal}` : '';
    const wholeStr = !absStr && !fractionStr ? 0 : `${absStr}${fractionStr}`;
    return ` ${wholeStr}" `;
  },
};
export const pxToUnitView = (val, unit) => UNIT_LABEL_FORMAT[unit](val);
