import { CylinderLightboxSvg } from './components/CylinderLightboxSvg';
import { CylinderLightboxWidgetModel } from './models';
import { CylinderLightboxPanelContent } from './components/CylinderLightboxPanelContent';
import { WidgetOptions } from '../../WidgetWorkspace/models/WorkspaceModel';

export const CylinderLightboxWidgetOptionsInfo:WidgetOptions = {
  WidgetModel: CylinderLightboxWidgetModel,
  RawSvgComponent: CylinderLightboxSvg,
  controlPanelProps: {
    PanelContent: CylinderLightboxPanelContent,
  },
  specFileExtension: 'cyl',
};
