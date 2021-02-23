import React from 'react';
import { observer } from 'mobx-react';
import { range } from 'lodash';
import { IPreferencesModel } from '../../../../models/PreferencesModel';
import { IPyramidNetFactoryModel } from '../../../../models/PyramidNetMakerStore';
import { radToDeg } from '../../../../../common/util/units';
import { lineLerp, matrixWithTransformOrigin } from '../../../../../common/util/geom';

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
export const DielinesLayer = observer(({
  widgetStore, preferencesStore,
}: {
  preferencesStore: IPreferencesModel, widgetStore: IPyramidNetFactoryModel,
}) => {
  if (!preferencesStore || !widgetStore) {
    return null;
  }
  const {
    fitToCanvasTranslationStr,
    pyramidNetSpec: {
      masterBaseTabCut,
      masterBaseTabScore,
      netPaths: { cut, score },
      decorationCutPath,
      texturePathD, pathScaleMatrix, borderInsetFaceHoleTransformMatrix, faceInteriorAngles,
      faceBoundaryPoints,
      faceIsSymmetrical,
      pyramid: { geometry: { faceCount } },
      femaleAscendantFlap, ascendantEdgeTabs, nonTabbedAscendantScores,
    },
  } = widgetStore;

  const {
    cutProps, scoreProps, useClonesForBaseTabs, useClonesForDecoration,
  } = preferencesStore;

  const DecorationContent = () => {
    if (!texturePathD) {
      return null;
    }
    const DECORATION_CUT_ID = 'face-decoration-cut';
    if (!useClonesForDecoration) {
      return (<path id={DECORATION_CUT_ID} {...cutProps} d={decorationCutPath.getD()} />);
    }
    const CUT_HOLES_ID = 'cut-holes-master';
    return (
      <g id={DECORATION_CUT_ID}>
        {range(faceCount).map((index) => {
          // TODO: transform matrix calculation not DRY with image faces and non-cloned decoration cut
          const isMirrored = !!(index % 2) && !faceIsSymmetrical;
          const xScale = isMirrored ? -1 : 1;
          const asymmetryNudge = isMirrored ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
          const baseTabRotationRad = -1 * index * faceInteriorAngles[2];
          const decorationRotationRad = xScale * baseTabRotationRad + asymmetryNudge;
          const cloneTransformMatrix = (new DOMMatrixReadOnly())
            .scale(xScale, 1).rotate(radToDeg(decorationRotationRad));

          return index === 0
            ? (
              <g key={index} id={CUT_HOLES_ID} transform={borderInsetFaceHoleTransformMatrix.toString()}>
                {texturePathD && (
                  <path d={texturePathD} transform={pathScaleMatrix.toString()} {...cutProps} />
                )}
              </g>

            ) : (
              <>
                <use
                  key={`${index}-decoration`}
                  xlinkHref={`#${CUT_HOLES_ID}`}
                  transform={
                    cloneTransformMatrix.toString()
                  }
                />
              </>
            );
        })}
      </g>
    );
  };

  const ClonePyramidNetContent = () => {
    const BASE_TAB_ID = 'base-tab';
    const faceMasterBaseMidpoint = lineLerp(faceBoundaryPoints[1], faceBoundaryPoints[2], 0.5);

    return (
      <>
        <path d={ascendantEdgeTabs.male.score.getD()} {...scoreProps} />
        <path d={ascendantEdgeTabs.male.cut.getD()} {...cutProps} />
        <path d={ascendantEdgeTabs.female.score.getD()} {...scoreProps} />
        <path d={ascendantEdgeTabs.female.cut.getD()} {...cutProps} />
        <path d={femaleAscendantFlap.getD()} {...cutProps} />
        <path d={nonTabbedAscendantScores.getD()} {...scoreProps} />

        {range(faceCount).map((index) => {
          const isMirrored = !!(index % 2) && !faceIsSymmetrical;
          const xScale = isMirrored ? -1 : 1;
          const asymmetryNudge = isMirrored ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
          const baseTabRotationRad = -1 * index * faceInteriorAngles[2];
          const decorationRotationRad = xScale * baseTabRotationRad + asymmetryNudge;
          const cloneTransformMatrix = (new DOMMatrixReadOnly())
            .scale(xScale, 1).rotate(radToDeg(decorationRotationRad));

          return index === 0
            ? (
              <g id={BASE_TAB_ID}>
                <path d={masterBaseTabCut.getD()} {...cutProps} />
                <path d={masterBaseTabScore.getD()} {...scoreProps} />
              </g>
            ) : (
              <g key={`${index}-base-tab`} transform={cloneTransformMatrix.toString()}>
                <use
                  xlinkHref={`#${BASE_TAB_ID}`}
                  transform={matrixWithTransformOrigin(
                    faceMasterBaseMidpoint,
                    (new DOMMatrixReadOnly()).scale(isMirrored ? -1 : 1, 1),
                  ).toString()}
                />
              </g>
            );
        })}
      </>
    );
  };

  return (
    <>
      <DielineGroup>
        <g transform={fitToCanvasTranslationStr}>
          {useClonesForBaseTabs ? (<ClonePyramidNetContent />) : (
            <>
              <path className="net-score" {...scoreProps} d={score.getD()} />
              <path className="net-cut" {...cutProps} d={cut.getD()} />
              <DecorationContent />
            </>
          )}
        </g>
      </DielineGroup>
    </>
  );
});
