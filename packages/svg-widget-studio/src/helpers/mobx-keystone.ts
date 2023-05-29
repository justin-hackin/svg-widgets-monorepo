import {
  AnyModel, ExtendedModel, findParent, model, ModelClass, ModelProps, UndoManager,
} from 'mobx-keystone';
import { BaseWidgetClass } from '../classes/BaseWidgetClass';
import { widgetClassToWidgetNameMap, widgetNameToIconMap, widgetNameToWidgetClassMap } from '../internal/data';

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

export function widgetModel(modelName: string, previewIcon: string) {
  return function <C extends ModelClass<BaseWidgetClass>>(constructor: C): C {
    const decoratedClass = model(`SvgWidgetStudio/widgets/${modelName}`)(constructor);
    widgetNameToWidgetClassMap.set(modelName, decoratedClass);
    widgetClassToWidgetNameMap.set(decoratedClass, modelName);
    widgetNameToIconMap.set(modelName, previewIcon);
    return decoratedClass;
  };
}

export function WidgetModel<T extends ModelProps>(modelOptions: T) {
  return ExtendedModel(BaseWidgetClass, modelOptions);
}
