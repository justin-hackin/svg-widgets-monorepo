import { WorkspaceModel } from './components/WidgetWorkspace/models/WorkspaceModel';

declare global {
  interface Window {
    dataLayer: Array<any>,
    workspaceStore: WorkspaceModel,
  }
}
