// @ts-ignore
import React from 'react';
import { range } from 'lodash';
import { IPreferencesModel } from '../../../models/PreferencesModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';
import {
  lineLerp, matrixWithTransformOrigin, radToDeg,
} from '../../../../common/util/geom';

const DielineGroup = ({ children }) => (
  <g {...{
    id: 'dielines',
    'inkscape:groupmode': 'layer',
    'inkscape:label': 'Dielines',
  }}
  >
    {children}
  </g>
);
export const PyramidNet = ({
  widgetStore, preferencesStore,
}:{
  preferencesStore: IPreferencesModel, widgetStore: IPyramidNetFactoryModel,
}) => {
  if (!preferencesStore || !widgetStore) { return null; }
  const {
    fitToCanvasTranslation,
    pyramidNetSpec: {
      masterBaseTab,
      makePaths: { cut, score },
      useClones, texturePathD, pathScaleMatrix, borderInsetFaceHoleTransformMatrix, faceInteriorAngles,
      faceBoundaryPoints,
      pyramid: { geometry: { faceCount } },
      femaleAscendantFlap, ascendantEdgeTabs, nonTabbedAscendantScores,
    },
  } = widgetStore;
  const fitInBoundsTransform = `translate(${fitToCanvasTranslation.x}, ${fitToCanvasTranslation.y})`;

  const { cutProps, scoreProps } = preferencesStore;

  if (useClones) {
    const CUT_HOLES_ID = 'cut-holes';
    const BASE_TAB_ID = 'base-tab';
    const faceMasterBaseMidpoint = lineLerp(faceBoundaryPoints[1], faceBoundaryPoints[2], 0.5);
    return (
      <DielineGroup>
        <g transform={fitInBoundsTransform}>
          <path d={ascendantEdgeTabs.male.score.getD()} {...scoreProps} />
          <path d={ascendantEdgeTabs.male.cut.getD()} {...cutProps} />
          <path d={ascendantEdgeTabs.female.score.getD()} {...scoreProps} />
          <path d={ascendantEdgeTabs.female.cut.getD()} {...cutProps} />
          <path d={femaleAscendantFlap.getD()} {...cutProps} />
          <path d={nonTabbedAscendantScores.getD()} {...scoreProps} />

          {range(faceCount).map((index) => {
            const isOdd = !!(index % 2);
            const xScale = isOdd ? -1 : 1;
            const asymmetryNudge = isOdd ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
            const baseTabRotationRad = -1 * index * faceInteriorAngles[2];
            const decorationRotationRad = xScale * baseTabRotationRad + asymmetryNudge;
            const cloneTransformMatrix = (new DOMMatrixReadOnly())
              .scale(xScale, 1).rotate(radToDeg(decorationRotationRad));

            return index === 0
              ? (
                <>
                  <g key={index} id={CUT_HOLES_ID} transform={borderInsetFaceHoleTransformMatrix.toString()}>
                    { texturePathD && (
                    <path d={texturePathD} transform={pathScaleMatrix.toString()} {...cutProps} />
                    )}
                  </g>
                  <g id={BASE_TAB_ID}>
                    <path d={masterBaseTab.cut.getD()} {...cutProps} />
                    <path d={masterBaseTab.score.getD()} {...scoreProps} />
                  </g>
                </>
              ) : (
                <>
                  <use
                    key={`${index}-decoration`}
                    xlinkHref={`#${CUT_HOLES_ID}`}
                    transform={
                    cloneTransformMatrix.toString()
                  }
                  />
                  <g key={`${index}-base-tab`} transform={cloneTransformMatrix.toString()}>
                    <use
                      xlinkHref={`#${BASE_TAB_ID}`}
                      transform={matrixWithTransformOrigin(
                        faceMasterBaseMidpoint,
                        (new DOMMatrixReadOnly()).scale(isOdd ? -1 : 1, 1),
                      ).toString()}
                    />
                  </g>
                </>
              );
          })}
        </g>
      </DielineGroup>
    );
  }
  return (
    <DielineGroup>
      <g transform={fitInBoundsTransform}>
        <path className="score" {...scoreProps} d={score.getD()} />
        <path className="cut" {...cutProps} d={cut.getD()} />
      </g>
    </DielineGroup>
  );
};
