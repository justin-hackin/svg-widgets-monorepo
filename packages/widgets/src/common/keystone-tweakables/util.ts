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
  ReferenceWithOptionsMetadata, WithOptionsMetadata,
} from './types';

export const ownPropertyName = (node: object) => {
  const parent = getParent(node);
  if (!parent) { return undefined; }
  const toPath = getParentToChildPath(parent, node);
  return toPath ? (toPath[0] as string) : undefined;
};

export function optionsIsListResolver<T>(
  options: MetadataOptions<T>,
): options is OptionsListResolverFactory<T> {
  return isFunction(options);
}
type referenceNodeType = TweakableReferenceWithOptionsModel<any, ReferenceWithOptionsMetadata<any>>;
type nodeType = TweakablePrimitiveWithOptionsModel<any, WithOptionsMetadata<any>>
| referenceNodeType;

export function createOptionsGetter(node: nodeType) {
  Object.defineProperty(node, 'options', {
    get() {
      if (!this.metadata) { return undefined; }
      return optionsIsListResolver(this.metadata.options)
        ? this.metadata.options(this)
        : this.metadata.options;
    },
  });
}

export const isFunctionOverride = (override: labelOverride): override is labelGenerator => isFunction(override);
export const resolveLabel = (node: TweakableModel) => {
  if (!node.metadata) { return ''; }
  const {
    ownPropertyName,
    metadata: { labelOverride },
  } = node;
  if (labelOverride) {
    return isFunctionOverride(labelOverride) ? labelOverride(node) : labelOverride;
  }
  return startCase(ownPropertyName);
};
