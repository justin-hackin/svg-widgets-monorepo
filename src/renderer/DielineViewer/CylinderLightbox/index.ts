import { CylinderLightboxSvg } from './components/CylinderLightboxSvg';
import { CylinderLightBoxModel } from './models';
import { CylinderLightboxPanelContent } from './components/CylinderLightboxPanelContent';

export const CylinderLightboxWidgetOptionsInfo = {
  WidgetModel: CylinderLightBoxModel,
  RawSvgComponent: CylinderLightboxSvg,
  controlPanelProps: {
    PanelContent: CylinderLightboxPanelContent,
  },
};
