import { createContext } from 'mobx-keystone';

import type { AnyMetadata } from '../types';

export const propertyMetadataCtx = createContext<AnyMetadata>();
export const widgetNameToWidgetClassMap = new Map();
// TODO: consider using bimap, this looks good: https://rimbu.org/docs/collections/bimap
export const widgetClassToWidgetNameMap = new Map();
export const widgetNameToIconMap = new Map();
