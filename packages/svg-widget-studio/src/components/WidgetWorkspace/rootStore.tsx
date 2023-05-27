import { connectReduxDevTools, registerRootStore } from 'mobx-keystone';
import React, { createContext, useContext } from 'react';
import { WorkspaceModel } from './models/WorkspaceModel';
// previews must follow WorkspaceModel import
import { IS_DEVELOPMENT_BUILD } from '../../internal/constants';

export const workspaceStore = new WorkspaceModel({});
registerRootStore(workspaceStore);
const WorkspaceStoreContext = createContext<WorkspaceModel>(workspaceStore);

export const { Provider: WorkspaceProvider } = WorkspaceStoreContext;

export function WorkspaceStoreProvider({ children }) {
  return <WorkspaceProvider value={workspaceStore}>{children}</WorkspaceProvider>;
}

export function useWorkspaceMst(): WorkspaceModel {
  return useContext(WorkspaceStoreContext);
}

export function useSelectedStore<T>():T {
  const workspace = useWorkspaceMst();
  return workspace.selectedStore as unknown as T;
}

if (IS_DEVELOPMENT_BUILD) {
  // @ts-ignore
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
