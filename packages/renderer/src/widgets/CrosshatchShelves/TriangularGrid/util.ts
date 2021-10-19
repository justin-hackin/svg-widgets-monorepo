import Flatten from '@flatten-js/core';
import { PathData } from '../../../common/path/PathData';

const { point } = Flatten;

export enum TRI_NOTCH_LEVEL {
  BOTTOM,
  MID,
  TOP,
}

export const calculateAngledNotchWidth = (angleOfIncidence: number, materialThichness: number) => {
  const aii = Math.PI - angleOfIncidence;
  const lenInsideIntersection = materialThichness / Math.tan(aii);
  const lenOutsideIntersection = materialThichness / Math.sin(aii);
  return lenInsideIntersection + lenOutsideIntersection;
};

export const triNotchPanel = (
  panelLength: number, panelDepth: number,
  notchCenterDistances: number[], materialThickness: number, triNotchLevel: TRI_NOTCH_LEVEL,
): PathData => {
  const notchThickness = calculateAngledNotchWidth((4 / 3) * Math.PI, materialThickness);
  const path = new PathData();
  const topNotchDepth = triNotchLevel === TRI_NOTCH_LEVEL.TOP
    ? null
    : (panelDepth * ((triNotchLevel === TRI_NOTCH_LEVEL.BOTTOM ? 2 : 1) / 3));
  path.move([0, 0]);
  const bottomNotchDepth = triNotchLevel === TRI_NOTCH_LEVEL.BOTTOM ? null
    : ((triNotchLevel === TRI_NOTCH_LEVEL.TOP ? 2 : 1) / 3);

  if (topNotchDepth !== null) {
    for (const notchCenterDistance of notchCenterDistances) {
      const notchStartX = notchCenterDistance - notchThickness / 2;
      const notchEndX = notchCenterDistance + notchThickness / 2;

      path.line(point(notchStartX, 0))
        .line(point(notchStartX, topNotchDepth))
        .line(point(notchEndX, topNotchDepth))
        .line(point(notchEndX, 0));
    }
  }

  path.line(point(panelLength, 0)).line(point(panelLength, panelDepth));
  if (bottomNotchDepth !== null) {
    for (const notchCenterDistance of notchCenterDistances) {
      const notchStartX = panelLength - notchCenterDistance + notchThickness / 2;
      const notchEndX = panelLength - notchCenterDistance - notchThickness / 2;
      path.line(point(notchStartX, panelDepth))
        .line(point(notchStartX, panelDepth - bottomNotchDepth))
        .line(point(notchEndX, panelDepth - bottomNotchDepth))
        .line(point(notchEndX, panelDepth));
    }
  }
  return path.line(point(0, panelDepth)).close();
};
