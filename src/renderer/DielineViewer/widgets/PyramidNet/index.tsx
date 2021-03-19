import { PyramidNet } from './PyramidNetSvg';
import { PyramidNetPluginModel } from '../../models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from './components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from './components/AdditionalFileMenuItems';
import { PanelContent } from './components/PanelContent';
import { TextureTransformEditor } from '../../../TextureTransformEditor';
import { ROUTES } from '../../../../common/constants';

export const PyramidNetOptionsInfo = {
  RawSvgComponent: PyramidNet,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetPluginModel,
  additionalRoutes: {
    [ROUTES.TEXTURE_EDITOR]: TextureTransformEditor,
  },
};
