import svgpath from 'svgpath';
import {
  CompoundPath, Path, Size, Project,
} from 'paper';

import { VERY_LARGE_NUMBER } from '../constants';
import { PathData } from '../path/PathData';

const tinySize = new Size(64, 48);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const project = (new Project(tinySize));

// this is kludgey because paper.js needs a canvas to work but the paths are never rendered
// this will probably never be fixed: https://github.com/paperjs/paper.js/issues/1325
// yet is is a small bit of inelegance to pay for the alternative of trying to use an addon as previously attempted in:
// https://github.com/justin-hackin/lib2geom-path-boolean-addon

function pathFromD(pathData) {
  const param = { pathData };
  return pathData.match(/m/gi).length > 1 || /z\S+/i.test(pathData)
    ? new CompoundPath(param)
    : new Path(param);
}

export function intersectDValues(d1, d2) {
  const d1Path = pathFromD(d1);
  const d2Path = pathFromD(d2);
  return d2Path.intersect(d1Path).pathData;
}

export function subtractDValues(d1, d2) {
  const d1Path = pathFromD(d1);
  const d2Path = pathFromD(d2);
  return d1Path.subtract(d2Path).pathData;
}

export function unifyDValues(d1, d2) {
  const d1Path = new CompoundPath(d1);
  const d2Path = new CompoundPath(d2);
  return d1Path.unite(d2Path).pathData;
}

export const getBoundedTexturePathD = (
  decorationBoundaryPathD, texturePathD, textureTransformMatrixStr, isPositive,
) => {
  const texturePathTransformedD = svgpath(texturePathD).transform(textureTransformMatrixStr).toString();

  if (isPositive) {
    const punchoutPath = new PathData();
    punchoutPath
      .move([-VERY_LARGE_NUMBER, -VERY_LARGE_NUMBER])
      .line([VERY_LARGE_NUMBER, -VERY_LARGE_NUMBER])
      .line([VERY_LARGE_NUMBER, VERY_LARGE_NUMBER])
      .line([-VERY_LARGE_NUMBER, VERY_LARGE_NUMBER])
      .close();
    const punchoutPathTransformedD = svgpath(
      punchoutPath.getD(),
    ).transform(textureTransformMatrixStr).toString();
    const punchedPathD = subtractDValues(punchoutPathTransformedD, texturePathTransformedD);
    return intersectDValues(punchedPathD, decorationBoundaryPathD);
  }
  return intersectDValues(texturePathTransformedD, decorationBoundaryPathD);
};
