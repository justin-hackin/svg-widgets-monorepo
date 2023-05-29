import { createContext, ModelClass } from 'mobx-keystone';

import type { AnyMetadata } from '../types';
import type { BaseWidgetClass } from '../classes/BaseWidgetClass';

export const propertyMetadataCtx = createContext<AnyMetadata>();
export const widgetNameToWidgetClassMap = new Map<string, ModelClass<BaseWidgetClass>>();
// TODO: consider using bimap, this looks good: https://rimbu.org/docs/collections/bimap
export const widgetClassToWidgetNameMap = new Map<ModelClass<BaseWidgetClass>, string>();
export const widgetNameToIconMap = new Map<string, string>();
