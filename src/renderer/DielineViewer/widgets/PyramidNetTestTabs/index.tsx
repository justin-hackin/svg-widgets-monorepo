import { PyramidNetPluginModel } from '../../models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from '../PyramidNet/components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from '../PyramidNet/components/AdditionalFileMenuItems';
import { PanelContent } from '../PyramidNet/components/PanelContent';
import { PyramidNetTestTabs } from './PyramidNetTestTabsSvg';

export const PyramidNetTestTabsOptionsInfo = {
  RawSvgComponent: PyramidNetTestTabs,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetPluginModel,
};
