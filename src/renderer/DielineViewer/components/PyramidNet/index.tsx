import { PyramidNet } from './PyramidNetSvg';
import { PyramidNetFactoryModel } from '../../models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from './components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from './components/AdditionalFileMenuItems';
import { PanelContent } from './components/PanelContent';

export const PyramidNetOptionsInfo = {
  RawSvgComponent: PyramidNet,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetFactoryModel,
};
