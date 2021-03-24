import { PyramidNet } from './PyramidNetSvg';
import { PyramidNetPluginModel } from '../../models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from './components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from './components/AdditionalFileMenuItems';
import { PanelContent } from './components/PanelContent';
import { TextureTransformEditor } from '../../../TextureTransformEditor';

export const PyramidNetOptionsInfo = {
  RawSvgComponent: PyramidNet,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetPluginModel,
  additionalMainContent: TextureTransformEditor,
};
