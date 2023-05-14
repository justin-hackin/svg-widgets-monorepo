import { connectReduxDevTools, registerRootStore } from 'mobx-keystone';
import React, { createContext, useContext } from 'react';
import { WorkspaceModel } from './models/WorkspaceModel';
// previews must follow WorkspaceModel import
import { PyramidNetWidgetModel } from '../widgets/PyramidNet/models/PyramidNetWidgetStore';
import { CylinderLightboxWidgetModel } from '../widgets/CylinderLightbox';
import { SquareGridDividerWidgetModel } from '../widgets/CrosshatchShelves/SquareGridDividerWidgetModel';
import { DiamondGridDividerWidgetModel } from '../widgets/CrosshatchShelves/DiamondGridDividerWidgetModel';
import { TriangularGridWidgetModel } from '../widgets/CrosshatchShelves/TriangularGrid';
import { IS_DEVELOPMENT_BUILD } from '../common/constants';

// eslint-disable-next-line no-console
console.log('Widgets: ', [
  PyramidNetWidgetModel,
  CylinderLightboxWidgetModel,
  SquareGridDividerWidgetModel,
  DiamondGridDividerWidgetModel,
  TriangularGridWidgetModel,
]);

export const workspaceStore = new WorkspaceModel({});
registerRootStore(workspaceStore);
const WorkspaceStoreContext = createContext<WorkspaceModel>(workspaceStore);

export const { Provider: WorkspaceProvider } = WorkspaceStoreContext;

export function WorkspaceStoreProvider({ children }) {
  return <WorkspaceProvider value={workspaceStore}>{children}</WorkspaceProvider>;
}

export function useWorkspaceMst() {
  return useContext(WorkspaceStoreContext);
}

if (IS_DEVELOPMENT_BUILD) {
  window.workspaceStore = workspaceStore;
  // if this module is imported in web build,
  // `import "querystring"` appears in index bundle, breaks app
  // eslint-disable-next-line import/no-extraneous-dependencies
  import('remotedev').then(({ default: remotedev }) => {
    // create a connection to the monitor (for example with connectViaExtension)
    const connection = remotedev.connectViaExtension({
      name: 'Polyhedral Net Studio',
    });

    connectReduxDevTools(remotedev, connection, workspaceStore);
  });
}
