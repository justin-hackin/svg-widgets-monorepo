import React from 'react';
import { observer } from 'mobx-react';
import { PyramidNetUnobserved } from './PyramidNetSvg';
import { PyramidNetControlPanel } from './PyramidNetControlPanel';
import { IWorkspaceModel, useWorkspaceMst } from '../../models/WorkspaceModel';
import { defaultModelData } from '../../models';
import { PyramidNetFactoryModel } from '../../models/PyramidNetMakerStore';

export const ControlledSvgComponent = observer(() => {
  const { selectedStore, preferences } = useWorkspaceMst() as IWorkspaceModel;
  return (<PyramidNetUnobserved widgetStore={selectedStore} preferencesStore={preferences} />);
});

export const PyramidNetOptionsInfo = {
  RawSvgComponent: PyramidNetUnobserved,
  ControlPanelComponent: PyramidNetControlPanel,
  WidgetModel: PyramidNetFactoryModel,
  defaultSnapshot: defaultModelData,
  ControlledSvgComponent,
};
