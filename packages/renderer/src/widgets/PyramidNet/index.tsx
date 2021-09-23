import { PyramidNetWidgetModel } from './models/PyramidNetWidgetStore';
import { AdditionalFileMenuItems } from './components/AdditionalFileMenuItems';
import { PanelContent } from './components/PanelContent';
import { TextureEditorDrawer } from './components/TextureEditorDrawer';
import { WidgetOptions } from '../../WidgetWorkspace/types';

export const PyramidNetOptionsInfo: WidgetOptions = {
  controlPanelProps: {
    AdditionalFileMenuItems,
    PanelContent,
  },
  WidgetModel: PyramidNetWidgetModel,
  AdditionalMainContent: TextureEditorDrawer,
  specFileExtension: 'pns',
  specFileExtensionName: 'Pyramid net spec',
};
