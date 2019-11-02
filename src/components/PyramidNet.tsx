// @ts-ignore
import { Point } from '@flatten-js/core';
import React from 'react';
import range from 'lodash-es/range';
import {
  radToDeg,
  degToRad, hingedPlot,
  hingedPlotByProjectionDistance,
  insetPoints,
  triangleAnglesGivenSides, subtractPointsArrays,
} from '../util/geom';
import {
  AscendantEdgeTabsSpec, BaseEdgeConnectionTabSpec, StrokeDashPathSpec,
  ascendantEdgeConnectionTabs,
  baseEdgeConnectionTab,
  roundedEdgePath, strokeDashPath,
} from '../util/shapes';

export interface StyleSpec {
  dieLineProps: object,
  cutLineProps: object,
  scoreLineProps: object,
  designBoundaryProps: object,
}

interface DieLinesSpec {
  ascendantEdgeTabsSpec: AscendantEdgeTabsSpec,
  baseEdgeTabSpec: BaseEdgeConnectionTabSpec,
  interFaceScoreDashSpec: StrokeDashPathSpec,
}

export interface PyramidNetSpec {
  pyramidGeometry: PyramidGeometrySpec,
  styleSpec: StyleSpec,
  dieLinesSpec: DieLinesSpec,
}

interface PyramidGeometrySpec {
  faceEdgeLengths: number[],
  faceCount: number
}

export const PyramidNet = ({
  pyramidGeometry, styleSpec, dieLinesSpec: { ascendantEdgeTabsSpec, baseEdgeTabSpec, interFaceScoreDashSpec },
}: PyramidNetSpec) => {
  const { faceEdgeLengths, faceCount } = pyramidGeometry;
  const faceInteriorAngles = triangleAnglesGivenSides(faceEdgeLengths);

  const p1 = new Point(0, 0);
  const p2 = p1.add(new Point(faceEdgeLengths[0], 0));

  const v1 = Point.fromPolar([Math.PI - faceInteriorAngles[0], faceEdgeLengths[1]]);


  v1.y *= -1;
  const p3 = p2.add(v1);
  const boundaryPoints = [p1, p2, p3];
  const inset = insetPoints(boundaryPoints, ascendantEdgeTabsSpec.tabDepth);

  const borderOverlay = subtractPointsArrays(boundaryPoints, inset);

  const retractionDistance = 2;
  const outerPt1 = hingedPlotByProjectionDistance(p2, p1, faceInteriorAngles[2], -ascendantEdgeTabsSpec.tabDepth);
  const outerPt2 = hingedPlotByProjectionDistance(p1, p2, degToRad(-60), ascendantEdgeTabsSpec.tabDepth);

  const scoreProps = { ...styleSpec.dieLineProps, ...styleSpec.scoreLineProps };
  const cutProps = { ...styleSpec.dieLineProps, ...styleSpec.cutLineProps };

  const faceTabFenceposts = range(faceCount + 1).map(
    (index) => hingedPlot(
      p2, p1, Math.PI * 2 - index * faceInteriorAngles[2],
      index % 2 ? faceEdgeLengths[2] : faceEdgeLengths[0],
    ),
  );

  const designBoundaryPathAttrs = borderOverlay.pathAttrs(styleSpec.designBoundaryProps);


  const baseTabsInst = ascendantEdgeConnectionTabs(p2, p1, ascendantEdgeTabsSpec);

  return (
    <g overflow="visible">
      <symbol id="face-tile" overflow="visible">
        <g>
          <path {...designBoundaryPathAttrs} />
        </g>
      </symbol>

      {range(faceCount).map((index) => {
        const isOdd = index % 2;
        const yScale = isOdd ? -1 : 1;
        const rotation = ((index + (isOdd ? 1 : 0)) * faceInteriorAngles[2] * 360 * (isOdd ? 1 : -1)) / (2 * Math.PI);
        return <use key={index} transform={`scale(1 ${yScale}) rotate(${rotation})`} xlinkHref="#face-tile" />;
      })}
      <g id="male-tab" transform={`rotate(${radToDeg(-faceCount * faceInteriorAngles[2])})`}>
        <path {...cutProps} d={baseTabsInst.male.cut.getD()} />
        <path {...scoreProps} d={baseTabsInst.male.score.getD()} />
      </g>
      <g id="female-tab">
        <path {...cutProps} d={roundedEdgePath([p1, outerPt1, outerPt2, p2], retractionDistance).getD()} />
        <path {...scoreProps} d={baseTabsInst.female.score.getD()} />
        <path {...cutProps} d={baseTabsInst.female.cut.getD()} />
      </g>
      {/* eslint-disable-next-line arrow-body-style */}
      <g id="ascendant-edge-scores">
        {faceTabFenceposts.slice(1, -1).map((endPt, index) => {
          const pathData = strokeDashPath(p1, endPt, interFaceScoreDashSpec);
          return (<path key={index} {...scoreProps} d={pathData.getD()} />);
        })}
      </g>
      {faceTabFenceposts.slice(0, -1).map((edgePt1, index) => {
        const edgePt2 = faceTabFenceposts[index + 1];
        const baseEdgeTab = baseEdgeConnectionTab(edgePt1, edgePt2, baseEdgeTabSpec);
        return (
          <g key={index}>
            <path {...cutProps} d={baseEdgeTab.cut.getD()} />
            <path {...scoreProps} d={baseEdgeTab.score.getD()} />
          </g>
        );
      })}
    </g>
  );
};
