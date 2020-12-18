import { Instance, types } from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React, { createContext, useContext } from 'react';
import persist from 'mst-persist';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';

import { observer } from 'mobx-react';
import { CM_TO_PIXELS_RATIO } from '../../common/util/geom';
import { SVGWrapper } from '../data/SVGWrapper';
import { PreferencesModel } from './PreferencesModel';
import { PyramidNetOptionsInfo } from '../components/PyramidNet';

export const WorkspaceModel = types.model({
  svgDimensions: types.frozen({ width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 }),
  widgetOptions: types.frozen({
    'pyramid-net': PyramidNetOptionsInfo,
  }),
  selectedWidgetName: 'pyramid-net',
})
  .views((self) => ({
    get selectedWidgetInfo() {
      return self.widgetOptions[self.selectedWidgetName];
    },
    get SelectedRawSvgComponent() {
      return this.selectedWidgetInfo.RawSvgComponent;
    },
    get selectedStore() {
      return this.selectedWidgetInfo.WidgetModel.create(this.selectedWidgetInfo.defaultSnapshot);
    },
    get selectedControlPanelProps() {
      return this.selectedWidgetInfo.controlPanelProps;
    },
    get preferences() {
      const preferencesStore = PreferencesModel.create({});
      persist('preferencesStoreLocal', preferencesStore);
      return preferencesStore;
    },
    get SelectedControlPanelComponent() {
      return this.selectedWidgetInfo.ControlPanelComponent;
    },
    get SelectedControlledSvgComponent() {
      const ObservedSvgComponent = observer(this.SelectedRawSvgComponent);

      return observer(() => (
        <ObservedSvgComponent widgetStore={this.selectedStore} preferencesStore={this.preferences} />));
    },
  }))
  .actions((self) => ({
    renderWidgetToString() {
      const { SelectedRawSvgComponent } = self;
      return ReactDOMServer.renderToString(
        <SVGWrapper {...self.svgDimensions}>
          <SelectedRawSvgComponent
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

if (process.env.NODE_ENV !== 'production') {
  connectReduxDevtools(remotedev, workspaceStore);
  makeInspectable(workspaceStore);
}
