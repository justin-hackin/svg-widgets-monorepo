import { createContext } from 'mobx-keystone';
import type { AnyMetadata } from '../keystone-tweakables/types';

export const propertyMetadataCtx = createContext<AnyMetadata>();
