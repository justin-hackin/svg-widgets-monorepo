import { AnyModel, findParent, UndoManager } from 'mobx-keystone';

interface NodeWithHistory extends AnyModel {
  history: UndoManager
}

export function getNearestHistoryFromAncestorNode(node): UndoManager {
  const hasHistory = (testNode) => (testNode as NodeWithHistory).history instanceof UndoManager;
  if (hasHistory(node)) {
    return node.history;
  }
  const parentWithHistory = findParent(node, hasHistory);
  return parentWithHistory ? parentWithHistory.history : undefined;
}
