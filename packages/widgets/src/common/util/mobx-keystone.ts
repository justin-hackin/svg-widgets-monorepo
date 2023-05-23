import {
  AnyModel, findParent, Path, resolvePath, UndoManager,
} from 'mobx-keystone';

export function tryResolvePath<T>(object: object, path: Path): T | undefined {
  const res = resolvePath<T>(object, path);
  return res.resolved ? res.value : undefined;
}

interface NodeWithHistory extends AnyModel {
  history: UndoManager
}

export function getNearestHistoryFromAncestorNode(node): UndoManager {
  const hasHistory = (testNode) => (testNode as NodeWithHistory).history instanceof UndoManager;
  if (hasHistory(node)) { return node.history; }
  const parentWithHistory = findParent(node, hasHistory);
  return parentWithHistory ? parentWithHistory.history : undefined;
}
