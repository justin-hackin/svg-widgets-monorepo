// @ts-ignore
import React from 'react';
import { IPreferencesModel } from '../../../models/PreferencesModel';
import { IPyramidNetPluginModel } from '../../../models/PyramidNetMakerStore';
import { PrintLayer } from './components/PrintLayer';
import { DielinesLayer } from './components/DielinesLayer';

export const PyramidNet = ({
  widgetStore, preferencesStore,
}:{
  preferencesStore: IPreferencesModel, widgetStore: IPyramidNetPluginModel,
}) => (
  <>
    <PrintLayer preferencesStore={preferencesStore} widgetStore={widgetStore} />
    <DielinesLayer preferencesStore={preferencesStore} widgetStore={widgetStore} />
  </>
);
