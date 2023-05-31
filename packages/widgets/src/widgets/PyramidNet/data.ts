import { createContext } from 'mobx-keystone';
import type { PyramidNetWidgetModel } from '@/widgets/PyramidNet/models/PyramidNetWidgetStore';

export const widgetModelCtx = createContext<PyramidNetWidgetModel>();
