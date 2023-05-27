import svgPathBbox from 'svg-path-bbox';
import {
  BoundingBoxAttrs,
  Dimensions,
  DocumentAreaProps,
  documentAreaPropsAreViewBoxProps,
  ViewBoxProps,
} from '../types';

export const boundingBoxOfBoundingBoxes = (bbs: BoundingBoxAttrs[]): BoundingBoxAttrs => {
  const noDimBB = bbs.reduce((acc, bb) => {
    Object.keys(acc)
      .forEach((key) => {
        const isMax = key.endsWith('max');
        acc[key] = Math[isMax ? 'max' : 'min'](bb[key], acc[key]);
      });
    return acc;
  }, {
    xmin: Infinity,
    ymin: Infinity,
    xmax: -Infinity,
    ymax: -Infinity,
  });
  return {
    ...noDimBB,
    width: noDimBB.xmax - noDimBB.xmin,
    height: noDimBB.ymax - noDimBB.ymin,
  };
};
export const castToViewBox = (dap: DocumentAreaProps) => (documentAreaPropsAreViewBoxProps(dap)
  ? dap.viewBox : `0 0 ${dap.width} ${dap.height}`);
export const getDimensionsFromPathD = (d): Dimensions => {
  const [xmin, ymin, xmax, ymax] = svgPathBbox(d);
  return {
    width: xmax - xmin,
    height: ymax - ymin,
  };
};
export const getBoundingBoxAttrs = (pathD: string): BoundingBoxAttrs => {
  const [xmin, ymin, xmax, ymax] = svgPathBbox(pathD);
  return {
    xmin,
    ymin,
    xmax,
    ymax,
    width: xmax - xmin,
    height: ymax - ymin,
  };
};
export const toRectangleCoordinatesAttrs = (bb: BoundingBoxAttrs) => ({
  width: bb.width,
  height: bb.height,
  x: bb.xmin,
  y: bb.ymin,
});
export const expandBoundingBoxAttrs = (vb: BoundingBoxAttrs, margin: number) => ({
  xmin: vb.xmin - margin,
  ymin: vb.ymin - margin,
  xmax: vb.xmax + margin,
  ymax: vb.ymax + margin,
  width: vb.width + 2 * margin,
  height: vb.height + 2 * margin,
});
export const boundingBoxMinPoint = (bb: BoundingBoxAttrs) => ({
  x: bb.xmin,
  y: bb.ymin,
});
export const viewBoxMaxPoint = (bb: BoundingBoxAttrs) => ({
  x: bb.xmax,
  y: bb.ymax,
});
export const viewBoxStrToBoundingBoxAttrs = (viewBoxStr: string): BoundingBoxAttrs => {
  const [xmin, ymin, width, height] = viewBoxStr.split(' ')
    .map((str) => parseFloat(str.trim()));
  return {
    xmin,
    ymin,
    width,
    height,
    xmax: xmin + width,
    ymax: ymin + height,
  };
};
export const boundingBoxAttrsToViewBoxStr = (bb: BoundingBoxAttrs) => `${bb.xmin} ${bb.ymin} ${bb.width} ${bb.height}`;
export const pathDToViewBoxStr = (d: string) => boundingBoxAttrsToViewBoxStr(getBoundingBoxAttrs(d));
export const castDocumentAreaPropsToBoundingBoxAttrs = (dap: DocumentAreaProps): BoundingBoxAttrs => {
  const { viewBox } = dap as ViewBoxProps;
  if (viewBox) {
    return viewBoxStrToBoundingBoxAttrs(viewBox);
  }
  const {
    width,
    height,
  } = dap as Dimensions;
  return {
    xmin: 0,
    ymin: 0,
    xmax: width,
    ymax: height,
    width,
    height,
  };
};
