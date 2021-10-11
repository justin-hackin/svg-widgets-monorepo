import { createContext } from 'mobx-keystone';
import { AnyMetadata } from './types';

export const propertyMetadataCtx = createContext<AnyMetadata>();
