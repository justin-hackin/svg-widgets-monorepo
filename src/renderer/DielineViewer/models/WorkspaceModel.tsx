import { Instance, types } from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React, { createContext, useContext } from 'react';

import { CM_TO_PIXELS_RATIO } from '../../common/util/geom';
import { SVGWrapper } from '../data/SVGWrapper';
import { PreferencesModel } from './PreferencesModel';
import { PyramidNetFactoryModel } from './PyramidNetMakerStore';
import { defaultModelData } from './index';
import { PyramidNetUnobserved } from '../components/PyramidNet/PyramidNetSvg';

export const WorkspaceModel = types.model({
  svgDimensions: types.frozen({ width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 }),
  selectedStore: types.optional(PyramidNetFactoryModel, defaultModelData),
  preferences: types.optional(PreferencesModel, {}),
})
  .actions((self) => ({
    renderWidgetToString() {
      return ReactDOMServer.renderToString(
        <SVGWrapper {...self.svgDimensions}>
          <PyramidNetUnobserved
            preferencesStore={self.preferences}
            widgetStore={self.selectedStore}
          />
        </SVGWrapper>,
      );
    },
  }));

export interface IWorkspaceModel extends Instance<typeof WorkspaceModel> {}

export const workspaceStore = WorkspaceModel.create({});
const WorkspaceStoreContext = createContext<IWorkspaceModel>(workspaceStore);

export const { Provider: WorkspaceProvider } = WorkspaceStoreContext;

export const WorkspaceStoreProvider = ({ children }) => (
  <WorkspaceProvider value={workspaceStore}>{children}</WorkspaceProvider>
);

export function useWorkspaceMst() {
  return useContext(WorkspaceStoreContext);
}
