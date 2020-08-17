const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractCutHolesFromSvgString = (svgString:string):string => {
  const doc = parseString(svgString);
  const path = doc.querySelector('path:last-of-type');
  return path ? path.getAttribute('d') : null;
};

export const extractViewBoxFromSvg = (svgString:string):string => {
  const doc = parseString(svgString);
  return doc.querySelector('svg').getAttribute('viewBox');
};
