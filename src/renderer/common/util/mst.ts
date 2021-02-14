import { startCase } from 'lodash';
import {
  applyPatch, getPath, getRoot, joinJsonPath,
} from 'mobx-state-tree';
import { CURRENT_UNIT } from './geom';

export const mstDataToProps = (node, property, labelOverride = undefined, useUnits = false) => {
  const value = node[property];
  const valuePath = joinJsonPath([getPath(node), property]);
  const setValue = (val) => {
    applyPatch(node, {
      op: 'replace',
      path: `/${property}`,
      value: val,
    });
  };
  const label = `${labelOverride || startCase(property)}${useUnits ? ` (${CURRENT_UNIT})` : ''}`;
  return {
    value,
    valuePath,
    setValue,
    label,
  };
};

// @ts-ignore
export const getHistory: IUndoManagerWithGroupState = (node) => getRoot(node).history;
