import { CylinderLightboxSvg } from './components/CylinderLightboxSvg';
import { CylinderLightBoxModel } from './models';
import { CylinderLightboxPanelContent } from './components/CylinderLightboxPanelContent';
import { WidgetOptions } from '../../models/WorkspaceModel';

export const CylinderLightboxWidgetOptionsInfo:WidgetOptions = {
  WidgetModel: CylinderLightBoxModel,
  RawSvgComponent: CylinderLightboxSvg,
  controlPanelProps: {
    PanelContent: CylinderLightboxPanelContent,
  },
  specFileExtension: 'cyl',
};
