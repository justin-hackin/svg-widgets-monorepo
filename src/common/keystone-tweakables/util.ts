import { getParent, getParentToChildPath } from 'mobx-keystone';
import { isFunction, startCase } from 'lodash-es';
import type { TweakablePrimitiveWithOptionsModel } from './models/TweakablePrimitiveWithOptionsModel';
import type { TweakableReferenceWithOptionsModel } from './models/TweakableReferenceWithOptionsModel';
import type {
  labelGenerator,
  labelOverride,
  MetadataOptions,
  OptionsListResolverFactory,
  TweakableModel,
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
  if (node.options) { return; }
  Object.defineProperty(node, 'options', {
    get: optionsIsListResolver(node.metadata.options)
      ? node.metadata.options(rootStore, node)
      : () => node.metadata.options,
    configurable: true,
  });
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
