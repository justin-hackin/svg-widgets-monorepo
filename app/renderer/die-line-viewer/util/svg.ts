const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractCutHolesFromSvgString = (svgString) => {
  const doc = parseString(svgString);
  const path = doc.querySelector('path:last-of-type');
  return path ? path.getAttribute('d') : null;
};

export const extractViewBoxFromSvg = (svgString) => {
  const doc = parseString(svgString);
  debugger; // eslint-disable-line no-debugger
  return doc.querySelector('svg').getAttribute('viewBox');
};
