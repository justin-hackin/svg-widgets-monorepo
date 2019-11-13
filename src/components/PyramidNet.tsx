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
} from '~util/geom';
import {
  AscendantEdgeTabsSpec, BaseEdgeConnectionTabSpec, StrokeDashPathSpec,
  ascendantEdgeConnectionTabs,
  baseEdgeConnectionTab,
  roundedEdgePath, strokeDashPath,
} from '~util/shapes';
import { PathData } from '~util/PathData';

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


export const PyramidNet = observer(({ store }) => {
  const {
    pyramidGeometry, styleSpec, shapeHeightInCm,
    dieLinesSpec: { ascendantEdgeTabsSpec, baseEdgeTabSpec, interFaceScoreDashSpec },
  } = store;
  const { relativeFaceEdgeLengths, faceCount } = pyramidGeometry;
  const faceInteriorAngles = triangleAnglesGivenSides(relativeFaceEdgeLengths);

  const heightInPixels = CM_TO_PIXELS_RATIO * shapeHeightInCm;
  const desiredFirstLength = heightInPixels / pyramidGeometry.firstEdgeLengthToShapeHeight;
  const faceLengthAdjustRatio = desiredFirstLength / relativeFaceEdgeLengths[0];
  const actualFaceEdgeLengths = relativeFaceEdgeLengths.map((len) => len * faceLengthAdjustRatio);
  const ascendantEdgeTabDepth = actualFaceEdgeLengths[0] * ascendantEdgeTabsSpec.tabDepthToTraversalLength;

  const p1 = new Point(0, 0);
  const p2 = p1.add(new Point(actualFaceEdgeLengths[0], 0));
  const v1 = Point.fromPolar([Math.PI - faceInteriorAngles[0], actualFaceEdgeLengths[1]]);
  v1.y *= -1;
  const p3 = p2.add(v1);

  const boundaryPoints = [p1, p2, p3];
  // TODO: can be converted to a path inset using @flatten-js/polygon-offset
  const inset = insetPoints(boundaryPoints, ascendantEdgeTabDepth);
  const borderOverlay = subtractPointsArrays(boundaryPoints, inset);

  const scoreProps = { ...styleSpec.dieLineProps, ...styleSpec.scoreLineProps };
  const cutProps = { ...styleSpec.dieLineProps, ...styleSpec.cutLineProps };

  const cutPathAggregate = new PathData();
  const scorePathAggregate = new PathData();
  // inter-face scoring
  const faceTabFenceposts = range(faceCount + 1).map(
    (index) => hingedPlot(
      p2, p1, Math.PI * 2 - index * faceInteriorAngles[2],
      index % 2 ? actualFaceEdgeLengths[2] : actualFaceEdgeLengths[0],
    ),
  );
  faceTabFenceposts.slice(1, -1).forEach((endPt) => {
    const pathData = strokeDashPath(p1, endPt, interFaceScoreDashSpec);
    scorePathAggregate.concatPath(pathData);
  });

  // female tab outer flap
  const outerPt1 = hingedPlotByProjectionDistance(p2, p1, faceInteriorAngles[2], -ascendantEdgeTabDepth);
  const outerPt2 = hingedPlotByProjectionDistance(p1, p2, degToRad(-60), ascendantEdgeTabDepth);
  cutPathAggregate.concatPath(
    roundedEdgePath([p1, outerPt1, outerPt2, p2], ascendantEdgeTabsSpec.flapRoundingDistance),
  );

  // base edge tabs
  faceTabFenceposts.slice(0, -1).forEach((edgePt1, index) => {
    const edgePt2 = faceTabFenceposts[index + 1];
    const baseEdgeTab = baseEdgeConnectionTab(edgePt1, edgePt2, ascendantEdgeTabDepth, baseEdgeTabSpec);
    cutPathAggregate.concatPath(baseEdgeTab.cut);
    scorePathAggregate.concatPath(baseEdgeTab.score);
  });

  // male tabs
  const ascendantTabs = ascendantEdgeConnectionTabs(p2, p1, ascendantEdgeTabsSpec);
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
          <path {...styleSpec.designBoundaryProps} d={borderOverlay.pathAttrs().d} />
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
