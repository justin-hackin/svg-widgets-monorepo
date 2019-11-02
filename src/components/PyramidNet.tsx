import { subtract } from '@flatten-js/boolean-op';
// @ts-ignore
import { Point, Polygon } from '@flatten-js/core';
import React from 'react';
import range from 'lodash-es/range';
import {
  radToDeg,
  degToRad, hingedPlot,
  hingedPlotByProjectionDistance,
  insetPoints,
  triangleAnglesGivenSides,
} from '../util/geom';
import {
  AscendantEdgeTabsSpec, BaseEdgeConnectionTabSpec,
  ascendantEdgeConnectionTabs,
  baseEdgeConnectionTab,
  roundedEdgePath, strokeDashPath,
} from '../util/shapes';


interface StyleSpec {
  dieLineProps: object,
  cutLineProps: object,
  scoreLineProps: object,
  designBoundaryProps: object,
}

interface PyramidNetSpec {
  pyramidGeometry: PyramidGeometrySpec,
  ascendantEdgeTabsSpec: AscendantEdgeTabsSpec,
  baseEdgeTabSpec: BaseEdgeConnectionTabSpec,
  styleSpec: StyleSpec,
}

interface PyramidGeometrySpec {
  faceEdgeLengths: number[],
  faceCount: number
}

export const PyramidNet = ({
  pyramidGeometry, ascendantEdgeTabsSpec, baseEdgeTabSpec, styleSpec,
}: PyramidNetSpec) => {
  const { faceEdgeLengths, faceCount } = pyramidGeometry;
  const faceInteriorAngles = triangleAnglesGivenSides(faceEdgeLengths);

  const p1 = new Point(0, 0);
  const p2 = p1.add(new Point(faceEdgeLengths[0], 0));

  const v1 = Point.fromPolar([Math.PI - faceInteriorAngles[0], faceEdgeLengths[1]]);

  const subtractPointsArrays = (pts1, pts2) => {
    const polygon1 = new Polygon();
    polygon1.addFace(pts1);

    const polygon2 = new Polygon();
    polygon2.addFace(pts2);

    return subtract(polygon1, polygon2);
  };

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

  const borderMaskPathAttrs = borderOverlay.pathAttrs(styleSpec.designBoundaryProps);

  const PHI = (1 + Math.sqrt(5)) / 2;
  let relativeStrokeDasharray = range(15).reduce((acc, i) => {
    const mux = Math.sqrt(3) * i;
    acc.push(mux * PHI, mux);
    return acc;
  }, []);
  relativeStrokeDasharray = relativeStrokeDasharray.concat(relativeStrokeDasharray.slice(0).reverse());

  const ascendantScoreDashSpec = {
    relativeStrokeDasharray,
    strokeDashLength: 10,
    strokeDashOffsetRatio: 0.75,
  };

  const tabScoreDashSpec = {
    relativeStrokeDasharray: [2, 1],
    strokeDashLength: 0.1,
    strokeDashOffsetRatio: 0,
  };

  const connectionTabsInst = ascendantEdgeConnectionTabs(p2, p1, ascendantEdgeTabsSpec, tabScoreDashSpec);

  return (
    <g overflow="visible">
      <symbol id="face-tile" overflow="visible">
        <g>
          <path {...borderMaskPathAttrs} />
        </g>
      </symbol>

      {range(faceCount).map((index) => {
        const isOdd = index % 2;
        const yScale = isOdd ? -1 : 1;
        const rotation = ((index + (isOdd ? 1 : 0)) * faceInteriorAngles[2] * 360 * (isOdd ? 1 : -1)) / (2 * Math.PI);
        return <use key={index} transform={`scale(1 ${yScale}) rotate(${rotation})`} xlinkHref="#face-tile" />;
      })}
      <g transform={`rotate(${radToDeg(-faceCount * faceInteriorAngles[2])})`}>
        <path {...cutProps} d={connectionTabsInst.male.cut.getD()} />
        <path {...scoreProps} d={connectionTabsInst.male.score.getD()} />
      </g>
      <path {...cutProps} d={roundedEdgePath([p1, outerPt1, outerPt2, p2], retractionDistance).getD()} />
      <path {...scoreProps} d={connectionTabsInst.female.score.getD()} />
      <path {...cutProps} d={connectionTabsInst.female.cut.getD()} />
      {/* eslint-disable-next-line arrow-body-style */}
      {faceTabFenceposts.slice(1, -1).map((endPt, index) => {
        const pathData = strokeDashPath(p1, endPt, ascendantScoreDashSpec);
        return (<path key={index} {...scoreProps} d={pathData.getD()} />);
      })}
      {faceTabFenceposts.slice(0, -1).map((edgePt1, index) => {
        const edgePt2 = faceTabFenceposts[index + 1];
        const baseEdgeTab = baseEdgeConnectionTab(edgePt1, edgePt2, baseEdgeTabSpec, tabScoreDashSpec);
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
