import Flatten from '@flatten-js/core';
import { PathData } from '@/common/PathData/module';

const { point } = Flatten;

export enum TRI_NOTCH_LEVEL {
  BOTTOM,
  MID,
  TOP,
}

export const calculateAngledNotchWidth = (angleOfIncidence: number, materialThickness: number) => {
  const aii = Math.PI - angleOfIncidence;
  const lenInsideIntersection = materialThickness / Math.abs(Math.tan(aii));
  const lenOutsideIntersection = materialThickness / Math.abs(Math.sin(aii));
  return lenInsideIntersection + lenOutsideIntersection;
};

export const triNotchPanel = (
  panelLength: number,
  panelDepth: number,
  notchCenterDistances: number[],
  materialThickness: number,
  triNotchLevel: TRI_NOTCH_LEVEL,
): PathData => {
  const notchThickness = calculateAngledNotchWidth((4 / 3) * Math.PI, materialThickness);
  const path = new PathData();
  const topNotchBottomY = triNotchLevel === TRI_NOTCH_LEVEL.TOP
    ? null
    : (panelDepth * ((triNotchLevel === TRI_NOTCH_LEVEL.BOTTOM ? 2 : 1) / 3));
  path.move([0, 0]);
  const bottomNotchTopY = triNotchLevel === TRI_NOTCH_LEVEL.BOTTOM ? null
    : panelDepth - panelDepth * ((triNotchLevel === TRI_NOTCH_LEVEL.TOP ? 2 : 1) / 3);

  if (topNotchBottomY !== null) {
    for (const notchCenterDistance of notchCenterDistances) {
      const notchStartX = notchCenterDistance - notchThickness / 2;
      const notchEndX = notchCenterDistance + notchThickness / 2;
      path.line(point(notchStartX, 0))
        .line(point(notchStartX, topNotchBottomY))
        .line(point(notchEndX, topNotchBottomY))
        .line(point(notchEndX, 0));
    }
  }

  path.line(point(panelLength, 0)).line(point(panelLength, panelDepth));
  if (bottomNotchTopY !== null) {
    for (const notchCenterDistance of notchCenterDistances) {
      const notchStartX = panelLength - notchCenterDistance + notchThickness / 2;
      const notchEndX = panelLength - notchCenterDistance - notchThickness / 2;
      path.line(point(notchStartX, panelDepth))
        .line(point(notchStartX, bottomNotchTopY))
        .line(point(notchEndX, bottomNotchTopY))
        .line(point(notchEndX, panelDepth));
    }
  }
  return path.line(point(0, panelDepth)).close();
};
