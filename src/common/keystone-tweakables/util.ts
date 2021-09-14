import { getParent, getParentToChildPath } from 'mobx-keystone';
import { computed, makeObservable } from 'mobx';
import { isFunction, startCase } from 'lodash';
import { TweakablePrimitiveWithOptionsModel } from './models/TweakablePrimitiveWithOptionsModel';
import { TweakableReferenceWithOptionsModel } from './models/TweakableReferenceWithOptionsModel';
import {
  TweakableModel,
  labelGenerator,
  labelOverride,
  MetadataOptions,
  OptionsListResolverFactory,
} from './types';

export const ownPropertyName = (node) => {
  const toPath = getParentToChildPath(getParent(node), node);
  return toPath ? (toPath[0] as string) : undefined;
};

export function optionsIsListResolver<T>(
  options: MetadataOptions<T>,
): options is OptionsListResolverFactory<T> {
  return isFunction(options);
}

export function createOptionsGetter(
  node: TweakablePrimitiveWithOptionsModel<any, any> | TweakableReferenceWithOptionsModel<any, any>,
  rootStore: object,
) {
  Object.defineProperty(node, 'options', {
    get: optionsIsListResolver(node.metadata.options)
      ? node.metadata.options(rootStore, node)
      : () => node.metadata.options,
    configurable: true,
  });
  makeObservable(node, { options: computed });
}

export const isFunctionOverride = (override: labelOverride): override is labelGenerator => isFunction(override);
export const resolveLabel = (node: TweakableModel) => {
  const {
    ownPropertyName,
    metadata: { labelOverride },
  } = node;
  if (labelOverride) {
    return isFunctionOverride(labelOverride) ? labelOverride(node) : labelOverride;
  }
  return startCase(ownPropertyName);
};
