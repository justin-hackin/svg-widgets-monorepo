// @ts-ignore
import { Matrix } from '@flatten-js/core';
import { observer } from 'mobx-react';
import React from 'react';
import range from 'lodash-es/range';
import {
  degToRad, hingedPlot,
  hingedPlotByProjectionDistance, radToDeg,
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

export interface StoreSpec {
  styleSpec: StyleSpec,
  pyramidNetSpec: PyramidNetSpec,
}

export interface PyramidNetSpec {
  pyramidGeometryId: string,
  pyramidGeometry?: PyramidGeometrySpec,
  interFaceScoreDashSpec: StrokeDashPathSpec,
  baseScoreDashSpec: StrokeDashPathSpec,
  ascendantEdgeTabsSpec: AscendantEdgeTabsSpec,
  baseEdgeTabSpec: BaseEdgeConnectionTabSpec,
  shapeHeightInCm: number,
}

export interface PyramidGeometrySpec {
  relativeFaceEdgeLengths: [number, number, number],
  diameter: number,
  faceCount: number,
  copiesNeeded: number,
}

export const FaceBoundary = observer(({ store }:{store: StoreSpec}) => {
  const {
    styleSpec: { designBoundaryProps },
    // @ts-ignore
    pyramidNetSpec: { borderOverlay },
  } = store;

  // TODO: can be converted to a path inset using @flatten-js/polygon-offset
  return (<path {...designBoundaryProps} d={borderOverlay.pathAttrs().d} />);
});

export const FaceBoundarySVG = ({ store }:{store: StoreSpec}) => {
  const {
    styleSpec: { designBoundaryProps },
    // @ts-ignore
    pyramidNetSpec: { borderOverlay },
  } = store;
  const {
    xmin, xmax, ymin, ymax,
  } = borderOverlay.box;

  // TODO: can be converted to a path inset using @flatten-js/polygon-offset
  return (
    <svg viewBox={`${xmin} ${ymin} ${xmax - xmin} ${ymax - ymin}`}>
      <path {...designBoundaryProps} d={borderOverlay.pathAttrs().d} />
    </svg>
  );
};

export const PyramidNet = observer(({ store }: {store: StoreSpec}) => {
  const {
    styleSpec,
    pyramidNetSpec: {
      pyramidGeometry: { faceCount },
      interFaceScoreDashSpec, baseScoreDashSpec,
      ascendantEdgeTabsSpec, baseEdgeTabSpec,
      // @ts-ignore
      tabIntervalRatios, tabGapIntervalRatios, boundaryPoints, faceInteriorAngles, actualFaceEdgeLengths, ascendantEdgeTabDepth, activeCutHolePatternD, textureImportWidth, borderInsetFaceHoleTransform, // eslint-disable-line
    },
  } = store;

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
    const baseEdgeTab = baseEdgeConnectionTab(
      edgePt1, edgePt2, ascendantEdgeTabDepth, baseEdgeTabSpec, baseScoreDashSpec,
    );
    cutPathAggregate.concatPath(baseEdgeTab.cut);
    scorePathAggregate.concatPath(baseEdgeTab.score);
  });

  // male tabs
  const ascendantTabs = ascendantEdgeConnectionTabs(
    boundaryPoints[1], boundaryPoints[0],
    ascendantEdgeTabsSpec, interFaceScoreDashSpec, tabIntervalRatios, tabGapIntervalRatios,
  );
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
          {/* eslint-disable-next-line react/no-danger */}
          { activeCutHolePatternD && textureImportWidth
          && (<path {...cutProps} d={activeCutHolePatternD} transform={borderInsetFaceHoleTransform} />)}
        </g>
      </symbol>

      {range(faceCount).map((index) => {
        const isOdd = !!(index % 2);
        const yScale = isOdd ? -1 : 1;

        const asymetryNudge = isOdd ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
        const rotation = radToDeg(-1 * yScale * index * faceInteriorAngles[2] + asymetryNudge);
        return <use key={index} transform={`scale(${yScale} 1) rotate(${rotation}) `} xlinkHref="#face-tile" />;
      })}

      <g id="die-lines">
        <path {...scoreProps} d={scorePathAggregate.getD()} />
        <path {...cutProps} d={cutPathAggregate.getD()} />
      </g>
    </g>
  );
});
