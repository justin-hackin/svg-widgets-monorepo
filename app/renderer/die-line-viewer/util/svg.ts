const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractViewBoxFromSvg = (svgString) => {
  const doc = parseString(svgString);
  return doc.querySelector('svg').getAttribute('viewBox');
};
