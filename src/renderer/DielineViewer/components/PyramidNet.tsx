// @ts-ignore
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { range } from 'lodash';
import {
  degToRad, hingedPlot, hingedPlotByProjectionDistance, radToDeg,
} from '../../common/util/geom';
import { PathData } from '../util/PathData';
import { strokeDashPath } from '../util/shapes/strokeDashPath';
import { baseEdgeConnectionTab } from '../util/shapes/baseEdgeConnectionTab';
import { ascendantEdgeConnectionTabs } from '../util/shapes/ascendantEdgeConnectionTabs';
import { closedPolygonPath, roundedEdgePath } from '../util/shapes/generic';
import { EVENTS } from '../../../main/ipc';
// eslint-disable-next-line import/no-cycle
import { IPyramidNetFactoryModel } from '../data/PyramidNetMakerStore';

export const PyramidNet = observer(({ store }: {store: IPyramidNetFactoryModel}) => {
  const {
    styleSpec,
    pyramidNetSpec: {
      pyramidGeometry: { faceCount },
      interFaceScoreDashSpec, baseScoreDashSpec,
      ascendantEdgeTabsSpec, baseEdgeTabsSpec,
      tabIntervalRatios, tabGapIntervalRatios,
      boundaryPoints, pathScaleMatrix, faceInteriorAngles,
      actualFaceEdgeLengths, ascendantEdgeTabDepth,
      activeCutHolePatternD, borderInsetFaceHoleTransformMatrix,
    },
  } = store;

  useEffect(() => {
    const setFaceDecorationHandler = (e, faceDecoration) => {
    // @ts-ignore
      store.pyramidNetSpec.setFaceDecoration(faceDecoration);
    };
    const sendShapeUpdateHandler = () => {
    // @ts-ignore
      store.pyramidNetSpec.sendTextureEditorUpdate();
    };

    globalThis.ipcRenderer.on(EVENTS.UPDATE_DIELINE_VIEWER, setFaceDecorationHandler);
    globalThis.ipcRenderer.on(EVENTS.REQUEST_SHAPE_UPDATE, sendShapeUpdateHandler);

    return () => {
      globalThis.ipcRenderer.removeListener(EVENTS.UPDATE_DIELINE_VIEWER, setFaceDecorationHandler);
      globalThis.ipcRenderer.removeListener('die>request-shape-update', sendShapeUpdateHandler);
    };
  }, []);


  // TODO: can be converted to a path inset using @flatten-js/polygon-offset

  const scoreProps = { ...styleSpec.dieLineProps, ...styleSpec.scoreLineProps };
  const cutProps = { ...styleSpec.dieLineProps, ...styleSpec.cutLineProps };
  const insetProps = { ...styleSpec.dieLineProps, stroke: '#00BBFF' };

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
      edgePt1, edgePt2, ascendantEdgeTabDepth, baseEdgeTabsSpec, baseScoreDashSpec,
    );
    cutPathAggregate.concatPath(baseEdgeTab.cut);
    scorePathAggregate.concatPath(baseEdgeTab.score);
  });

  // male tabs
  const ascendantTabs = ascendantEdgeConnectionTabs(
    boundaryPoints[1], boundaryPoints[0],
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
                <path d={closedPolygonPath(boundaryPoints).getD()} {...insetProps} />
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
