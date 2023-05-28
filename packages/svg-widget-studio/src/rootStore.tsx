import { registerRootStore } from 'mobx-keystone';
import React, { createContext, useContext } from 'react';
import { WorkspaceModel } from './models/WorkspaceModel';

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
