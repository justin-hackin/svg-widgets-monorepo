// @ts-ignore
import React from 'react';
import { PrintLayer } from './components/PrintLayer';
import { DielinesLayer } from './components/DielinesLayer';
import { RawSvgComponentProps } from '../../../models/WorkspaceModel';

export const PyramidNet = ({
  widgetStore, preferencesStore,
}:RawSvgComponentProps) => (
  <>
    <PrintLayer preferencesStore={preferencesStore} widgetStore={widgetStore} />
    <DielinesLayer preferencesStore={preferencesStore} widgetStore={widgetStore} />
  </>
);
