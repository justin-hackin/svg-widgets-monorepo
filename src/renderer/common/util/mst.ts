import {
  applyPatch, getParent, getPath, getType, isRoot, isValidReference, joinJsonPath,
} from 'mobx-state-tree';
import { IUndoManagerWithGroupState, UndoManagerWithGroupState } from '../components/UndoManagerWithGroupState';

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

export function getHistory(node): IUndoManagerWithGroupState {
  if (!isValidReference(() => node) || isRoot(node)) { return null; }
  if (node.history && getType(node.history) === UndoManagerWithGroupState) {
    return node.history;
  }
  const parent:any = getParent(node);
  if (!parent) { return null; }
  return getHistory(parent);
}
