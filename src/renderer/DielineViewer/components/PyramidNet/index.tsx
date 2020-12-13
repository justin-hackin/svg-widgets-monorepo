// @ts-ignore
import { observer } from 'mobx-react';
import React from 'react';
import { range } from 'lodash';
import { radToDeg } from '../../../common/util/geom';
import { closedPolygonPath } from '../../util/shapes/generic';
// eslint-disable-next-line import/no-cycle
import { usePreferencesMst, usePyramidNetFactoryMst } from '../../models';
import { IPreferencesModel } from '../../models/PreferencesModel';
// eslint-disable-next-line import/no-cycle
import { IPyramidNetFactoryModel } from '../../models/PyramidNetMakerStore';

export const PyramidNet = observer(({
  pyramidNetFactoryStore, preferencesStore,
}:{
  preferencesStore: IPreferencesModel, pyramidNetFactoryStore: IPyramidNetFactoryModel
}) => {
  const {
    pyramidNetSpec: {
      pyramid: { geometry: { faceCount } },
      faceBoundaryPoints, faceInteriorAngles,
      activeCutHolePatternD,
      borderInsetFaceHoleTransformMatrix,
      pathScaleMatrix,
    },
    makePaths: { cut, score },
    fitToCanvasTranslation,
  } = pyramidNetFactoryStore;
  const { cutProps, scoreProps, designBoundaryProps } = preferencesStore;
  const CUT_HOLES_ID = 'cut-holes';
  return (
    <g transform={`translate(${fitToCanvasTranslation.x}, ${fitToCanvasTranslation.y})`}>
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

export const PyramidNetStoreContainer = observer(() => {
  const pyramidNetFactoryStore = usePyramidNetFactoryMst();
  const preferencesStore = usePreferencesMst();

  return (
    <PyramidNet preferencesStore={preferencesStore} pyramidNetFactoryStore={pyramidNetFactoryStore} />
  );
});
