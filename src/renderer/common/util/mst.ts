import {
  applyPatch, getPath, getRoot, joinJsonPath,
} from 'mobx-state-tree';

export const mstDataToProps = (node, property) => {
  const value = node[property];
  const valuePath = joinJsonPath([getPath(node), property]);
  const setValue = (val) => {
    applyPatch(node, {
      op: 'replace',
      path: `/${property}`,
      value: val,
    });
  };

  return {
    value,
    valuePath,
    setValue,
  };
};

// @ts-ignore
export const getHistory: IUndoManagerWithGroupState = (node) => getRoot(node).history;
