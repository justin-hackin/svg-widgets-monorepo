import gcd from 'gcd';

export const UNITS = {
  cm: 'cm', in: 'in',
};
const INCHES_TO_CM_RATIO = 1.0 / 2.54;
export const INCHES_TO_PIXELS_RATIO = 96;
export const CM_TO_PIXELS_RATIO = INCHES_TO_CM_RATIO * INCHES_TO_PIXELS_RATIO;
export const UNIT_TO_PIXELS = {
  [UNITS.cm]: 1.0 / 2.54,
  [UNITS.in]: 96,
};
const IN_DENOMINATOR = 64;
export const UNIT_STEP = {
  [UNITS.cm]: CM_TO_PIXELS_RATIO * 0.1,
  [UNITS.in]: (1.0 / IN_DENOMINATOR) * INCHES_TO_PIXELS_RATIO,
};
export const UNIT_LABEL_FORMAT = {
  [UNITS.cm]: (val) => `${(val / UNIT_TO_PIXELS[UNITS.cm]).toFixed(3)} cm`,
  [UNITS.in]: (val) => {
    const unitVal = val / UNIT_TO_PIXELS[UNITS.in];
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
export const degToRad = (deg) => (deg * 2 * Math.PI) / 360;
export const radToDeg = (rad) => (360 * rad) / (Math.PI * 2);
