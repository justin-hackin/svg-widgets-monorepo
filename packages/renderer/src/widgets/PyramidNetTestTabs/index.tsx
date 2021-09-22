import { PyramidNetWidgetModel } from '../PyramidNet/models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from '../PyramidNet/components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from '../PyramidNet/components/AdditionalFileMenuItems';
import { PanelContent } from '../PyramidNet/components/PanelContent';
import { PyramidNetTestTabs } from './PyramidNetTestTabsSvg';
import { WidgetOptions } from '../../WidgetWorkspace/types';

export const PyramidNetTestTabsOptionsInfo: WidgetOptions = {
  RawSvgComponent: PyramidNetTestTabs,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetWidgetModel,
  specFileExtension: 'pns',
};
