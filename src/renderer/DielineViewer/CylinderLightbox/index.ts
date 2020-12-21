import { CylinderLightboxSvg } from './components/CylinderLightboxSvg';
import { CylinderLightBoxModel, defaultCylinderLightboxSnapshot } from './models';
import { CylinderLightboxPanelContent } from './components/CylinderLightboxPanelContent';

export const CylinderLightboxWidgetOptionsInfo = {
  defaultSnapshot: defaultCylinderLightboxSnapshot,
  WidgetModel: CylinderLightBoxModel,
  RawSvgComponent: CylinderLightboxSvg,
  controlPanelProps: {
    PanelContent: CylinderLightboxPanelContent,
  },
};
