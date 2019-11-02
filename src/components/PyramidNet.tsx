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
  ascendantEdgeConnectionTabs,
  baseEdgeConnectionTab,
  roundedEdgePath, strokeDashPath,
} from '../util/shapes';

export const PyramidNet = ({ netSpec }) => {
  const { faceEdgeLengths, faceCount } = netSpec;
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
  const tabDepth = 2;
  const inset = insetPoints(boundaryPoints, tabDepth);

  const borderOverlay = subtractPointsArrays(boundaryPoints, inset);

  const retractionDistance = 2;
  const tabRoundingDistance = 0.3;
  const outerPt1 = hingedPlotByProjectionDistance(p2, p1, faceInteriorAngles[2], -tabDepth);
  const outerPt2 = hingedPlotByProjectionDistance(p1, p2, degToRad(-60), tabDepth);

  const ascendantEdgeConnectionTabsDefaults = {
    tabsCount: 3,
    midpointDepthToTabDepth: 0.6,
    tabStartGapToTabDepth: 0.5,
    holeReachToTabDepth: 0.1,
    holeWidthRatio: 0.4,
    holeFlapTaperAngle: Math.PI / 10,
    tabWideningAngle: Math.PI / 6,
  };

  const plotProps = { fill: 'none', strokeWidth: 0.05 };
  const CUT_COLOR = '#FF244D';
  const SCORE_COLOR = '#BDFF48';
  const cutProps = { ...plotProps, stroke: CUT_COLOR };
  const scoreProps = { ...plotProps, stroke: SCORE_COLOR };

  const faceTabFenceposts = range(faceCount + 1).map(
    (index) => hingedPlot(
      p2, p1, Math.PI * 2 - index * faceInteriorAngles[2],
      index % 2 ? faceEdgeLengths[2] : faceEdgeLengths[0],
    ),
  );


  const borderMaskPathAttrs = borderOverlay.pathAttrs({ stroke: 'none', fill: 'rgba(0, 52, 255, 0.53)' });

  const defaultBaseEdgeConnectionTabSpec = {
    tabDepth: 3,
    holeDepthToTabDepth: 0.5,
    holeTaper: Math.PI / 4.5,
    holeBreadthToHalfWidth: 0.5,
    finDepthToTabDepth: 1.1,
    finTipDepthToFinDepth: 1.1,
  };

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

  const connectionTabsInst = ascendantEdgeConnectionTabs(p2, p1, {
    tabDepth, tabRoundingDistance, ...ascendantEdgeConnectionTabsDefaults,
  }, tabScoreDashSpec);

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
        const baseEdgeTab = baseEdgeConnectionTab(edgePt1, edgePt2, {
          ...defaultBaseEdgeConnectionTabSpec, roundingDistance: tabRoundingDistance * 5,
        }, tabScoreDashSpec);
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
