import { PyramidNet } from './PyramidNetSvg';
import { PyramidNetPluginModel } from './models/PyramidNetMakerStore';
import { AdditionalToolbarContent } from './components/AdditionalToolbarContent';
import { AdditionalFileMenuItems } from './components/AdditionalFileMenuItems';
import { PanelContent } from './components/PanelContent';
import { WidgetOptions } from '../../WidgetWorkspace/models/WorkspaceModel';
import { TextureEditorDrawer } from './components/TextureEditorDrawer';

export const PyramidNetOptionsInfo: WidgetOptions = {
  RawSvgComponent: PyramidNet,
  controlPanelProps: {
    AdditionalToolbarContent,
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetPluginModel,
  AdditionalMainContent: TextureEditorDrawer,
  specFileExtension: 'pns',
  specFileExtensionName: 'Pyramid net spec',
};
