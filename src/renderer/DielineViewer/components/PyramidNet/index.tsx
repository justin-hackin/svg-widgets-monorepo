// @ts-ignore
import { observer } from 'mobx-react';
import React from 'react';
import { range } from 'lodash';
import { radToDeg } from '../../../common/util/geom';
import { closedPolygonPath } from '../../util/shapes/generic';
// eslint-disable-next-line import/no-cycle
import { usePreferencesMst, usePyramidNetFactoryMst } from '../../models';

export const PyramidNet = observer(() => {
  const {
    makePaths: { cut, score },
    pyramidNetSpec: {
      pyramid: {
        geometry: { faceCount },
      },
      faceBoundaryPoints, pathScaleMatrix, faceInteriorAngles,
      activeCutHolePatternD, borderInsetFaceHoleTransformMatrix,
    },
  } = usePyramidNetFactoryMst();
  const styleSpec = usePreferencesMst();

  const scoreProps = { ...styleSpec.dieLineProps, ...styleSpec.scoreLineProps };
  const cutProps = { ...styleSpec.dieLineProps, ...styleSpec.cutLineProps };
  const designBoundaryProps = { ...styleSpec.dieLineProps, ...styleSpec.designBoundaryProps };

  const CUT_HOLES_ID = 'cut-holes';
  return (
    <g>
      <path className="score" {...scoreProps} d={score.getD()} />
      <path className="cut" {...cutProps} d={cut.getD()} />
      <g>
        {range(faceCount).map((index) => {
          const isOdd = !!(index % 2);
          const xScale = isOdd ? -1 : 1;
          const asymetryNudge = isOdd ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
          const rotationRad = -1 * xScale * index * faceInteriorAngles[2] + asymetryNudge;

          return index === 0
            ? (
              <g key={index} id={CUT_HOLES_ID} transform={borderInsetFaceHoleTransformMatrix.toString()}>
                <path d={closedPolygonPath(faceBoundaryPoints).getD()} {...designBoundaryProps} />
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
