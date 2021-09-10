import {isFunction, startCase} from 'lodash';
import { ControllableModel } from './controllable-property';

export type labelGenerator = (node: ControllableModel) => string;
export type labelOverride = string | labelGenerator;
export const isFunctionOverride = (override: labelOverride): override is labelGenerator => isFunction(override);

export const resolveLabel = (node: ControllableModel) => {
  // IDE thinks labelOverride is never used
  const { ownPropertyName, metadata: { labelOverride } } = node;
  if (labelOverride) {
    return isFunctionOverride(labelOverride) ? labelOverride(node) : labelOverride;
  }
  return startCase(ownPropertyName);
};
