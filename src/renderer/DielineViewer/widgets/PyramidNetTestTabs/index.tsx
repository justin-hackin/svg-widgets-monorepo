import { PyramidNetPluginModel } from '../../models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from '../PyramidNet/components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from '../PyramidNet/components/AdditionalFileMenuItems';
import { PanelContent } from '../PyramidNet/components/PanelContent';
import { PyramidNetTestTabs } from './PyramidNetTestTabsSvg';
import { WidgetOptions } from '../../models/WorkspaceModel';

export const PyramidNetTestTabsOptionsInfo: WidgetOptions = {
  RawSvgComponent: PyramidNetTestTabs,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetPluginModel,
  specFileExtension: 'pns',
};
