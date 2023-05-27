import { BoundingBoxAttrs, PathData } from 'fluent-svg-path-ts';
import { boundingBoxMinPoint, viewBoxMaxPoint } from 'svg-widget-studio';

const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractCutHolesFromSvgString = (svgString:string):string => {
  const doc = parseString(svgString);
  const path = doc.querySelector('path:last-of-type');
  return path ? (path.getAttribute('d') || '') : '';
};

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
