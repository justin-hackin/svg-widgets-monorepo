import { CylinderLightboxWidgetModel } from './models';
import { CylinderLightboxPanelContent } from './components/CylinderLightboxPanelContent';
import { WidgetOptions } from '../../WidgetWorkspace/types';

export const CylinderLightboxWidgetOptionsInfo:WidgetOptions = {
  WidgetModel: CylinderLightboxWidgetModel,
  controlPanelProps: {
    PanelContent: CylinderLightboxPanelContent,
  },
  specFileExtension: 'cyl',
};
