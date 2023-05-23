import { WorkspaceModel } from './src/WidgetWorkspace/models/WorkspaceModel';

declare global {
  interface Window {
    dataLayer: Array<any>,
    workspaceStore: WorkspaceModel
  }
}
