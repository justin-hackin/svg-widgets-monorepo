import { Theme } from '@mui/material/styles';
import { WorkspaceModel } from '../../renderer/src/WidgetWorkspace/models/WorkspaceModel';

interface ElectronApi {
  readonly versions: Readonly<NodeJS.ProcessVersions>
}

declare interface Window {
  electron: Readonly<ElectronApi>
  electronRequire?: NodeRequire,
  theme: Theme,
}

declare global {
  interface Window {
    dataLayer: Array<any>,
    workpsaceStore: WorkspaceModel
  }
}
