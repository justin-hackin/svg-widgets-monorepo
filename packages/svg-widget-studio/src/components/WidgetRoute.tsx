import React from 'react';
import { observer } from 'mobx-react';
import { widgetNameToWidgetClassMap } from '../internal/data';
import { useSelectedStore } from '../rootStore';
import { NestedRoutes } from './NestedRoutes';

/**
 * delays the rendering of the route until the selectedStore is assigned, preventing fussing with early exit
 * @param widgetName
 */
export const WidgetRoute = observer(({ widgetName, children }) => {
  if (!widgetNameToWidgetClassMap.has(widgetName)) {
    throw new Error('WidgetRoute must have prop widgetName corresponding'
      + ' to the name of the widget passed to the @widgetModel decorator');
  }
  const selectedStore = useSelectedStore();
  return <NestedRoutes base={`/widgets/${widgetName}`}>{selectedStore ? children : null}</NestedRoutes>;
});
