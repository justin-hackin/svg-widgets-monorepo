import React from 'react';
import { observer } from 'mobx-react';
import { TweakableChildrenInputs, useSelectedStore } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export const AscendantEdgeTabsControls = observer(() => {
  const store = useSelectedStore<PyramidNetWidgetModel>();
  return (
    <TweakableChildrenInputs parentNode={store.ascendantEdgeTabsSpec} />
  );
});
