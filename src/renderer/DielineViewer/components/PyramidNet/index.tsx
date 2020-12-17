import { PyramidNet } from './PyramidNetSvg';
import { PyramidNetControlPanel } from './PyramidNetControlPanel';
import { defaultModelData } from '../../models';
import { PyramidNetFactoryModel } from '../../models/PyramidNetMakerStore';

export const PyramidNetOptionsInfo = {
  RawSvgComponent: PyramidNet,
  ControlPanelComponent: PyramidNetControlPanel,
  WidgetModel: PyramidNetFactoryModel,
  defaultSnapshot: defaultModelData,
};
