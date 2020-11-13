// @ts-ignore
import { observer } from 'mobx-react';
import React from 'react';
import { range } from 'lodash';
import {
  degToRad, distanceFromOrigin, hingedPlot, hingedPlotByProjectionDistance, radToDeg, subtractPoints,
} from '../../../common/util/geom';
import { PathData } from '../../util/PathData';
import { strokeDashPath } from '../../util/shapes/strokeDashPath';
import { baseEdgeConnectionTab } from '../../util/shapes/baseEdgeConnectionTab';
import { ascendantEdgeConnectionTabs } from '../../util/shapes/ascendantEdgeConnectionTabs';
import { closedPolygonPath, roundedEdgePath } from '../../util/shapes/generic';
// eslint-disable-next-line import/no-cycle
import { useMst } from '../../models';

export const PyramidNet = observer(() => {
  const {
    styleSpec,
    pyramidNetSpec: {
      pyramid: {
        geometry: { faceCount },
      },
      interFaceScoreDashSpec, baseScoreDashSpec,
      ascendantEdgeTabsSpec, baseEdgeTabsSpec,
      tabIntervalRatios, tabGapIntervalRatios,
      decorationBoundaryPoints, pathScaleMatrix, faceInteriorAngles,
      actualFaceEdgeLengths, ascendantEdgeTabDepth,
      activeCutHolePatternD, borderInsetFaceHoleTransformMatrix,
    },
  } = useMst();


  const scoreProps = { ...styleSpec.dieLineProps, ...styleSpec.scoreLineProps };
  const cutProps = { ...styleSpec.dieLineProps, ...styleSpec.cutLineProps };
  const insetProps = { ...styleSpec.dieLineProps, stroke: '#00BBFF' };

  const cutPathAggregate = new PathData();
  const scorePathAggregate = new PathData();
  // inter-face scoring
  const faceTabFenceposts = range(faceCount + 1).map(
    (index) => hingedPlot(
      decorationBoundaryPoints[1], decorationBoundaryPoints[0], Math.PI * 2 - index * faceInteriorAngles[2],
      index % 2 ? actualFaceEdgeLengths[2] : actualFaceEdgeLengths[0],
    ),
  );
  faceTabFenceposts.slice(1, -1).forEach((endPt) => {
    const pathData = strokeDashPath(decorationBoundaryPoints[0], endPt, interFaceScoreDashSpec);
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
    decorationBoundaryPoints[1], decorationBoundaryPoints[0], flapApexAngle, -ascendantEdgeTabDepth,
  );
  const outerPt2 = hingedPlotByProjectionDistance(
    decorationBoundaryPoints[0], decorationBoundaryPoints[1], -FLAP_BASE_ANGLE, ascendantEdgeTabDepth,
  );
  const maxRoundingDistance = Math.min(
    distanceFromOrigin(subtractPoints(decorationBoundaryPoints[0], outerPt1)),
    distanceFromOrigin(subtractPoints(decorationBoundaryPoints[1], outerPt2)),
  );
  cutPathAggregate.concatPath(
    roundedEdgePath(
      [decorationBoundaryPoints[0], outerPt1, outerPt2, decorationBoundaryPoints[1]],
      ascendantEdgeTabsSpec.flapRoundingDistanceRatio * maxRoundingDistance,
    ),
  );

  // base edge tabs
  faceTabFenceposts.slice(0, -1).forEach((edgePt1, index) => {
    const edgePt2 = faceTabFenceposts[index + 1];
    const baseEdgeTab = baseEdgeConnectionTab(
      edgePt1, edgePt2, ascendantEdgeTabDepth, baseEdgeTabsSpec, baseScoreDashSpec,
    );
    cutPathAggregate.concatPath(baseEdgeTab.cut);
    scorePathAggregate.concatPath(baseEdgeTab.score);
  });

  // male tabs
  const ascendantTabs = ascendantEdgeConnectionTabs(
    decorationBoundaryPoints[1], decorationBoundaryPoints[0],
    ascendantEdgeTabsSpec, interFaceScoreDashSpec, tabIntervalRatios, tabGapIntervalRatios,
  );
  const rotationMatrix = `rotate(${radToDeg(-faceCount * faceInteriorAngles[2])})`;
  ascendantTabs.male.cut.transform(rotationMatrix);
  ascendantTabs.male.score.transform(rotationMatrix);
  cutPathAggregate.concatPath(ascendantTabs.male.cut);
  scorePathAggregate.concatPath(ascendantTabs.male.score);

  // female inner
  cutPathAggregate.concatPath(ascendantTabs.female.cut);
  scorePathAggregate.concatPath(ascendantTabs.female.score);

  const CUT_HOLES_ID = 'cut-holes';
  return (
    <g>
      <path className="score" {...scoreProps} d={scorePathAggregate.getD()} />
      <path className="cut" {...cutProps} d={cutPathAggregate.getD()} />
      <g>
        {range(faceCount).map((index) => {
          const isOdd = !!(index % 2);
          const xScale = isOdd ? -1 : 1;
          const asymetryNudge = isOdd ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
          const rotationRad = -1 * xScale * index * faceInteriorAngles[2] + asymetryNudge;

          return index === 0
            ? (
              <g key={index} id={CUT_HOLES_ID} transform={borderInsetFaceHoleTransformMatrix.toString()}>
                <path d={closedPolygonPath(decorationBoundaryPoints).getD()} {...insetProps} />
                { activeCutHolePatternD && (
                  <path d={activeCutHolePatternD} transform={pathScaleMatrix.toString()} {...cutProps} />
                ) }
              </g>
            ) : (
              <use
                key={index}
                xlinkHref={`#${CUT_HOLES_ID}`}
                transform={
                  (new DOMMatrixReadOnly())
                    .scale(xScale, 1)
                    .rotate(radToDeg(rotationRad))
                    .toString()
                }
              />
            );
        })}
      </g>
    </g>
  );
});
