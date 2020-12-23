// @ts-ignore
import React from 'react';
import { IPreferencesModel } from '../../../models/PreferencesModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';

export const PyramidNet = ({
  widgetStore, preferencesStore,
}:{
  preferencesStore: IPreferencesModel, widgetStore: IPyramidNetFactoryModel,
}) => {
  if (!preferencesStore || !widgetStore) { return null; }
  const {
    makePaths: { cut, score },
    fitToCanvasTranslation,
  } = widgetStore;
  const { cutProps, scoreProps } = preferencesStore;
  return (
    <g transform={`translate(${fitToCanvasTranslation.x}, ${fitToCanvasTranslation.y})`}>
      <path className="score" {...scoreProps} d={score.getD()} />
      <path className="cut" {...cutProps} d={cut.getD()} />
    </g>
  );
};
