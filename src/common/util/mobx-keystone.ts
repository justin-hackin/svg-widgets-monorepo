import {
  AnyModel, applyPatches, findParent, getParent, getParentToChildPath, getRootPath, Path, resolvePath, UndoManager,
} from 'mobx-keystone';

export function tryResolvePath<T>(object: object, path: Path): T | undefined {
  const res = resolvePath<T>(object, path);
  return res.resolved ? res.value : undefined;
}

export const ownPropertyName = (node) => {
  const toPath = getParentToChildPath(getParent(node), node);
  return toPath ? (toPath[0] as string) : undefined;
};

export const mstDataToProps = (node, property) => {
  const value = node[property];

  const valuePath = [...getRootPath(node).path, property].join('/');
  const setValue = (val) => {
    applyPatches(node, [{
      op: 'replace',
      path: [property],
      value: val,
    }]);
  };

  return {
    value,
    valuePath,
    setValue,
  };
};

interface NodeWithHistory extends AnyModel {
  history: UndoManager
}

export function getNearestHistoryFromAncestorNode(node): UndoManager {
  const hasHistory = (testNode) => (testNode as NodeWithHistory).history instanceof UndoManager;
  if (hasHistory(node)) { return node.history; }
  const parentWithHistory = findParent(node, hasHistory);
  return parentWithHistory ? parentWithHistory.history : undefined;
}
