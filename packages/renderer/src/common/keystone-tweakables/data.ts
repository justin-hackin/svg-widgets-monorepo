import { createContext } from 'mobx-keystone';
import { AnyMetadata } from './types';

export const propertyMetadataRegistry = new Map<string, AnyMetadata>();
export const propertyMetadataCtx = createContext<AnyMetadata>();
