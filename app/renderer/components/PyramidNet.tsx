// @ts-ignore
import { Point, Matrix } from '@flatten-js/core';
import { observer } from 'mobx-react';
import React from 'react';
import range from 'lodash-es/range';
import {
  degToRad, hingedPlot,
  hingedPlotByProjectionDistance,
  insetPoints,
  CM_TO_PIXELS_RATIO,
  triangleAnglesGivenSides, subtractPointsArrays,
} from '../util/geom';
import {
  AscendantEdgeTabsSpec, BaseEdgeConnectionTabSpec, StrokeDashPathSpec,
  ascendantEdgeConnectionTabs,
  baseEdgeConnectionTab,
  roundedEdgePath, strokeDashPath,
} from '../util/shapes';
import { PathData } from '../util/PathData';

export interface StyleSpec {
  dieLineProps: object,
  cutLineProps: object,
  scoreLineProps: object,
  designBoundaryProps: object,
}

export interface DieLinesSpec {
  ascendantEdgeTabsSpec: AscendantEdgeTabsSpec,
  baseEdgeTabSpec: BaseEdgeConnectionTabSpec,
  interFaceScoreDashSpec: StrokeDashPathSpec,
}

export interface PyramidNetSpec {
  pyramidGeometry: PyramidGeometrySpec,
  styleSpec: StyleSpec,
  dieLinesSpec: DieLinesSpec,
  shapeHeightInCm: number,
}

export interface PyramidGeometrySpec {
  relativeFaceEdgeLengths: [number, number, number],
  firstEdgeLengthToShapeHeight: number,
  faceCount: number
}

const getActualFaceEdgeLengths = (relativeFaceEdgeLengths, shapeHeightInCm, firstEdgeLengthToShapeHeight) => {
  const heightInPixels = CM_TO_PIXELS_RATIO * shapeHeightInCm;
  const desiredFirstLength = heightInPixels / firstEdgeLengthToShapeHeight;
  const faceLengthAdjustRatio = desiredFirstLength / relativeFaceEdgeLengths[0];
  return relativeFaceEdgeLengths.map((len) => len * faceLengthAdjustRatio);
};

const getBoundaryPoints = (l1, l2, a1) => {
  const p1 = new Point(0, 0);
  const p2 = p1.add(new Point(l1, 0));
  const v1 = Point.fromPolar([Math.PI - a1, l2]);
  v1.y *= -1;
  const p3 = p2.add(v1);
  return [p1, p2, p3];
};

const FaceBoundary = ({ store }:{store: PyramidNetSpec}) => {
  const {
    dieLinesSpec: { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } },
    pyramidGeometry: { relativeFaceEdgeLengths, firstEdgeLengthToShapeHeight },
    styleSpec: { designBoundaryProps }, shapeHeightInCm,
  } = store;
  const faceInteriorAngles = triangleAnglesGivenSides(relativeFaceEdgeLengths);
  const actualFaceEdgeLengths = getActualFaceEdgeLengths(
    relativeFaceEdgeLengths, shapeHeightInCm, firstEdgeLengthToShapeHeight,
  );
  const ascendantEdgeTabDepth = actualFaceEdgeLengths[0] * tabDepthToTraversalLength;

  const boundaryPoints = getBoundaryPoints(actualFaceEdgeLengths[0], actualFaceEdgeLengths[1], faceInteriorAngles[0]);
  // TODO: can be converted to a path inset using @flatten-js/polygon-offset
  const inset = insetPoints(boundaryPoints, ascendantEdgeTabDepth);
  const borderOverlay = subtractPointsArrays(boundaryPoints, inset);
  return (<path {...designBoundaryProps} d={borderOverlay.pathAttrs().d} />);
};

export const PyramidNet = observer(({ store }: {store: PyramidNetSpec}) => {
  const {
    pyramidGeometry, styleSpec, shapeHeightInCm,
    dieLinesSpec: { ascendantEdgeTabsSpec, baseEdgeTabSpec, interFaceScoreDashSpec },
  } = store;
  const { relativeFaceEdgeLengths, faceCount, firstEdgeLengthToShapeHeight } = pyramidGeometry;
  const faceInteriorAngles = triangleAnglesGivenSides(relativeFaceEdgeLengths);
  const actualFaceEdgeLengths = getActualFaceEdgeLengths(
    relativeFaceEdgeLengths, shapeHeightInCm, firstEdgeLengthToShapeHeight,
  );
  const ascendantEdgeTabDepth = actualFaceEdgeLengths[0] * ascendantEdgeTabsSpec.tabDepthToTraversalLength;

  const boundaryPoints = getBoundaryPoints(actualFaceEdgeLengths[0], actualFaceEdgeLengths[1], faceInteriorAngles[0]);
  // TODO: can be converted to a path inset using @flatten-js/polygon-offset

  const scoreProps = { ...styleSpec.dieLineProps, ...styleSpec.scoreLineProps };
  const cutProps = { ...styleSpec.dieLineProps, ...styleSpec.cutLineProps };

  const cutPathAggregate = new PathData();
  const scorePathAggregate = new PathData();
  // inter-face scoring
  const faceTabFenceposts = range(faceCount + 1).map(
    (index) => hingedPlot(
      boundaryPoints[1], boundaryPoints[0], Math.PI * 2 - index * faceInteriorAngles[2],
      index % 2 ? actualFaceEdgeLengths[2] : actualFaceEdgeLengths[0],
    ),
  );
  faceTabFenceposts.slice(1, -1).forEach((endPt) => {
    const pathData = strokeDashPath(boundaryPoints[0], endPt, interFaceScoreDashSpec);
    scorePathAggregate.concatPath(pathData);
  });

  // female tab outer flap
  const remainderGapAngle = 2 * Math.PI - faceInteriorAngles[2] * faceCount;
  if (remainderGapAngle < 0) {
    throw new Error('too many faces: the sum of angles at apex is greater than 360 degrees');
  }
  const FLAP_APEX_IMPINGE_MARGIN = Math.PI / 12;
  const FLAP_BASE_ANGLE = degToRad(60);

  const flapApexAngle = Math.min(remainderGapAngle - FLAP_APEX_IMPINGE_MARGIN, faceInteriorAngles[2]);
  const outerPt1 = hingedPlotByProjectionDistance(
    boundaryPoints[1], boundaryPoints[0], flapApexAngle, -ascendantEdgeTabDepth,
  );
  const outerPt2 = hingedPlotByProjectionDistance(
    boundaryPoints[0], boundaryPoints[1], -FLAP_BASE_ANGLE, ascendantEdgeTabDepth,
  );
  const maxRoundingDistance = Math.min(
    boundaryPoints[0].subtract(outerPt1).length, boundaryPoints[1].subtract(outerPt2).length,
  );
  cutPathAggregate.concatPath(
    roundedEdgePath(
      [boundaryPoints[0], outerPt1, outerPt2, boundaryPoints[1]],
      ascendantEdgeTabsSpec.flapRoundingDistanceRatio * maxRoundingDistance,
    ),
  );

  // base edge tabs
  faceTabFenceposts.slice(0, -1).forEach((edgePt1, index) => {
    const edgePt2 = faceTabFenceposts[index + 1];
    const baseEdgeTab = baseEdgeConnectionTab(edgePt1, edgePt2, ascendantEdgeTabDepth, baseEdgeTabSpec);
    cutPathAggregate.concatPath(baseEdgeTab.cut);
    scorePathAggregate.concatPath(baseEdgeTab.score);
  });

  // male tabs
  const ascendantTabs = ascendantEdgeConnectionTabs(boundaryPoints[1], boundaryPoints[0], ascendantEdgeTabsSpec);
  const rotationMatrix = (new Matrix()).rotate(-faceCount * faceInteriorAngles[2]);
  ascendantTabs.male.cut.transformPoints(rotationMatrix);
  ascendantTabs.male.score.transformPoints(rotationMatrix);
  cutPathAggregate.concatPath(ascendantTabs.male.cut);
  scorePathAggregate.concatPath(ascendantTabs.male.score);

  // female inner
  cutPathAggregate.concatPath(ascendantTabs.female.cut);
  scorePathAggregate.concatPath(ascendantTabs.female.score);

  return (
    <g overflow="visible">
      <symbol id="face-tile" overflow="visible">
        <g>
          <FaceBoundary store={store} />
        </g>
      </symbol>

      {range(faceCount).map((index) => {
        const isOdd = index % 2;
        const yScale = isOdd ? -1 : 1;
        const rotation = ((index + (isOdd ? 1 : 0)) * faceInteriorAngles[2] * 360 * (isOdd ? 1 : -1)) / (2 * Math.PI);
        return <use key={index} transform={`scale(1 ${yScale}) rotate(${rotation})`} xlinkHref="#face-tile" />;
      })}

      <g id="die-lines">
        <path {...scoreProps} d={scorePathAggregate.getD()} />
        <path {...cutProps} d={cutPathAggregate.getD()} />
      </g>
    </g>
  );
});
