import { createContext } from 'mobx-keystone';
import type { AnyMetadata } from './types';

export const propertyMetadataCtx = createContext<AnyMetadata>();
