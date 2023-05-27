import { WorkspaceModel } from 'svg-widget-studio';

declare global {
  interface Window {
    dataLayer: Array<any>,
    workspaceStore: WorkspaceModel
  }
}
