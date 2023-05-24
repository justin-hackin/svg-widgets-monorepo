import React from 'react';
import { getBoundingBoxAttrs } from '../../../common/util/svg';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export function PyramidNetTestTabs({ widgetStore }: { widgetStore: PyramidNetWidgetModel }) {
  const {
    testAscendantTab, testBaseTab,
    preferences: { scoreProps, outerCutProps },
  } = widgetStore;
  const tabs = [
    {
      id: 'ascendant-female',
      paths: testAscendantTab.female,
    },
    {
      id:
      'ascendant-male',
      paths: testAscendantTab.male,
    },
    {
      id:
      'base',
      paths: testBaseTab,
    },
  ];
  const Y_SPACING = 0;
  // returning the results of the reduce caused errors
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {tabs.reduce((acc, { id, paths }) => {
        // NOTE: the boundingViewBoxAttrs doesn't calculate path region property (seems to include control points),
        // thus items are improperly spaced
        const { ymin, ymax } = getBoundingBoxAttrs(paths.cut.getD());
        acc.y += -1 * ymin;
        acc.children.push(
          <g transform={`translate(0, ${acc.y})`} key={id} id={id}>
            <path className="score" {...scoreProps} d={paths.score.getD()} />
            <path className="cut" {...outerCutProps} d={paths.cut.getD()} />
          </g>,
        );
        acc.y += ymax + Y_SPACING;
        return acc;
      }, { children: [], y: 0 } as { children: JSX.Element[], y: number }).children}
    </>
  );
}
