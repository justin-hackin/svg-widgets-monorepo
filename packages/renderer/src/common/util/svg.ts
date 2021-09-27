import React from 'react';
import { svgPathBbox } from 'svg-path-bbox';
import { PathData } from '../path/PathData';

const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractCutHolesFromSvgString = (svgString:string):string => {
  const doc = parseString(svgString);
  const path = doc.querySelector('path:last-of-type');
  return path ? (path.getAttribute('d') || '') : '';
};

export const extractViewBoxFromSvg = (svgString:string) => {
  const doc:Document = parseString(svgString);
  return doc.querySelector('svg').getAttribute('viewBox');
};

export const namespacedElementFactory = (elName) => (p: any) => {
  const { children, ...props } = p;
  return React.createElement(elName, props, children);
};

export const getDimensionsFromPathD = (d) => {
  const [xmin, ymin, xmax, ymax] = svgPathBbox(d);
  return {
    width: xmax - xmin, height: ymax - ymin,
  };
};

interface BoundingBoxAttrs {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  width: number
  height: number
}

export const getBoundingBoxAttrs = (pathD:string):BoundingBoxAttrs => {
  const [xmin, ymin, xmax, ymax] = svgPathBbox(pathD);
  return {
    xmin, ymin, xmax, ymax, width: xmax - xmin, height: ymax - ymin,
  };
};
export const toRectangleCoordinatesAttrs = (bb: BoundingBoxAttrs) => ({
  width: bb.width, height: bb.height, x: bb.xmin, y: bb.ymin,
});

export const expandBoundingBoxAttrs = (vb: BoundingBoxAttrs, margin: number) => ({
  xmin: vb.xmin - margin,
  ymin: vb.ymin - margin,
  xmax: vb.xmax + margin,
  ymax: vb.ymax + margin,
  width: vb.width + 2 * margin,
  height: vb.height + 2 * margin,
});

export const boundingBoxMinPoint = (bb: BoundingBoxAttrs) => ({ x: bb.xmin, y: bb.ymin });
export const viewBoxMaxPoint = (bb: BoundingBoxAttrs) => ({ x: bb.xmax, y: bb.ymax });

export const viewBoxStrToViewBoxAttrs = (viewBoxStr: string): BoundingBoxAttrs => {
  const [xmin, ymin, width, height] = viewBoxStr.split(' ').map((str) => parseFloat(str.trim()));
  return {
    xmin, ymin, width, height, xmax: xmin + width, ymax: ymin + height,
  };
};
export const boundingBoxAttrsToViewBoxStr = (bb:BoundingBoxAttrs) => `${bb.xmin} ${bb.ymin} ${bb.width} ${bb.height}`;

export const pathDToViewBoxStr = (d:string) => boundingBoxAttrsToViewBoxStr(getBoundingBoxAttrs(d));

export const registrationMarksPath = (bb: BoundingBoxAttrs, markLength: number, facingOutward = false) => {
  const markOffset = facingOutward ? -1 * markLength : markLength;
  const topLegsBottom = bb.ymin + markOffset;
  const bottomLegsTop = bb.ymax - markOffset;
  const leftLegsRight = bb.xmin + markOffset;
  const rightLegsLeft = bb.xmax - markOffset;
  return (new PathData())
    .move({ x: bb.xmin, y: topLegsBottom })
    .line(boundingBoxMinPoint(bb))
    .line({ x: leftLegsRight, y: bb.ymin })
    .move({ x: rightLegsLeft, y: bb.ymin })
    .line({ x: bb.xmax, y: bb.ymin })
    .line({ x: bb.xmax, y: topLegsBottom })
    .move({ x: bb.xmax, y: bottomLegsTop })
    .line(viewBoxMaxPoint(bb))
    .line({ x: rightLegsLeft, y: bb.ymax })
    .move({ x: leftLegsRight, y: bb.ymax })
    .line({ x: bb.xmin, y: bb.ymax })
    .line({ x: bb.xmin, y: bottomLegsTop });
};
