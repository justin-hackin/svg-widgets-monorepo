import { observer } from 'mobx-react';
import React from 'react';

import { useTheme } from '@mui/styles';
import { PRINT_REGISTRATION_TYPES } from '../../../WidgetWorkspace/models/PreferencesModel';
import { PositionableFaceDecorationModel } from '../models/PositionableFaceDecorationModel';
import { boundingBoxMinPoint, expandBoundingBoxAttrs, registrationMarksPath } from '../../../common/util/svg';
import { pointToTranslateString, scalePoint } from '../../../common/util/geom';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { ImageFaceDecorationPatternModel } from '../models/ImageFaceDecorationPatternModel';
import { closedPolygonPath } from '../../../common/path/shapes/generic';

const PrintGroup = ({ children }) => (
  <g {...{
    id: 'print',
    'inkscape:groupmode': 'layer',
    'inkscape:label': 'Print',
  }}
  >
    {children}
  </g>
);
export const PrintLayer = observer(({
  widgetStore,
}: {
  widgetStore: PyramidNetWidgetModel,
}) => {
  const theme = useTheme();
  if (!widgetStore) {
    return null;
  }
  const {
    boundingBox,
    persistedSpec: {
      borderInsetFaceHoleTransformMatrix,
      faceDecoration,
      faceDecorationTransformMatricies,
      faceLengthAdjustRatio,
      faceBoundaryPoints,
    },
    preferences: {
      registrationPadding: { value: registrationPadding },
      printRegistrationType: { value: printRegistrationType },
      registrationMarkLength: { value: registrationMarkLength },
    },
  } = widgetStore;

  const printRegistrationBB = printRegistrationType === PRINT_REGISTRATION_TYPES.NONE
    ? boundingBox : expandBoundingBoxAttrs(boundingBox, registrationPadding);
  const dielineRegistrationBB = printRegistrationType === PRINT_REGISTRATION_TYPES.LASER_CUTTER
    ? expandBoundingBoxAttrs(printRegistrationBB, registrationMarkLength) : printRegistrationBB;
  const fitToCanvasTranslationStr = pointToTranslateString(scalePoint(boundingBoxMinPoint(dielineRegistrationBB), -1));

  if (!faceDecoration || !(faceDecoration instanceof PositionableFaceDecorationModel)) {
    return null;
  }
  const { pattern, transform: { transformMatrix } } = faceDecoration as PositionableFaceDecorationModel;
  if (!(pattern instanceof ImageFaceDecorationPatternModel)) {
    return null;
  }

  const { imageData, dimensions, isBordered } = pattern as ImageFaceDecorationPatternModel;
  const PRINT_IMAGE_ID = 'print-face-decoration';
  const PRINT_BLEED_PATH_ID = 'print-bleed-path-id';
  const CLIP_PATH_ID = 'clip-path';
  const BLUR_ID = 'blur-filter';
  const FACE_BOUNDARY_PATH_ID = 'face-boundary-path';
  const borderFill = theme.palette.grey['900'];
  const faceBoundaryPath = closedPolygonPath(faceBoundaryPoints);
  const faceBoundaryPathD = faceBoundaryPath.getD();
  const decorationBoundaryPathD = faceBoundaryPath.transform(borderInsetFaceHoleTransformMatrix.toString()).getD();

  return (
    <PrintGroup>
      <defs>
        <path id={FACE_BOUNDARY_PATH_ID} d={faceBoundaryPathD} fill={borderFill} />
        <clipPath id={CLIP_PATH_ID}>
          <use xlinkHref={`#${FACE_BOUNDARY_PATH_ID}`} />
        </clipPath>
        <filter id={BLUR_ID}>
          <feGaussianBlur stdDeviation={0.5} />
        </filter>
      </defs>
      <g transform={fitToCanvasTranslationStr}>
        {printRegistrationType === PRINT_REGISTRATION_TYPES.LASER_CUTTER
          && (
            <path
              className="print-registration-marks"
              stroke="black"
              fill="none"
              strokeWidth={1}
              d={registrationMarksPath(printRegistrationBB, registrationMarkLength).getD()}
            />
          )}
        { isBordered && (
        <g id="bleed-stroke-group">
          {
            faceDecorationTransformMatricies.map((cloneTransformMatrix, index) => (index === 0
              ? (
                <g key={index} id={PRINT_BLEED_PATH_ID}>
                  <use
                    id="bleed-stroke"
                    xlinkHref={`#${FACE_BOUNDARY_PATH_ID}`}
                    fill="none"
                    stroke={borderFill}
                    strokeWidth={faceLengthAdjustRatio * 20}
                    strokeLinejoin="round"
                  />
                </g>
              ) : (
                <use
                  key={`${index}-decoration`}
                  xlinkHref={`#${PRINT_BLEED_PATH_ID}`}
                  transform={cloneTransformMatrix.toString()}
                />
              )))
          }
        </g>
        )}
        <g id="print-decoration-group">
          {
            faceDecorationTransformMatricies.map((cloneTransformMatrix, index) => (index === 0
              ? (
                <g key={index} id={PRINT_IMAGE_ID}>
                  <use id="border-fill" xlinkHref={`#${FACE_BOUNDARY_PATH_ID}`} />
                  {isBordered && (
                    <>
                      <use
                        id="outer-glow"
                        xlinkHref={`#${FACE_BOUNDARY_PATH_ID}`}
                        fill="none"
                        stroke={theme.palette.grey['50']}
                        strokeWidth={faceLengthAdjustRatio}
                        filter={`url(#${BLUR_ID})`}
                        clipPath={`url(#${CLIP_PATH_ID})`}
                      />
                      <path
                        id="inner-glow"
                        d={decorationBoundaryPathD}
                        fill="none"
                        stroke={theme.palette.grey['50']}
                        strokeWidth={faceLengthAdjustRatio}
                        filter={`url(#${BLUR_ID})`}
                      />
                    </>
                  )}

                  <g transform={isBordered ? borderInsetFaceHoleTransformMatrix.toString() : ''}>
                    <g clipPath={`url(#${CLIP_PATH_ID})`}>
                      <image
                        xlinkHref={imageData}
                        {...dimensions}
                        transform={
                          (new DOMMatrixReadOnly())
                            .scale(faceLengthAdjustRatio, faceLengthAdjustRatio)
                            .multiply(transformMatrix)
                            .toString()
                        }
                      />
                    </g>
                  </g>
                </g>
              ) : (
                <use
                  key={`${index}-decoration`}
                  xlinkHref={`#${PRINT_IMAGE_ID}`}
                  transform={cloneTransformMatrix.toString()}
                />
              )))
          }
        </g>
      </g>
    </PrintGroup>
  );
});
