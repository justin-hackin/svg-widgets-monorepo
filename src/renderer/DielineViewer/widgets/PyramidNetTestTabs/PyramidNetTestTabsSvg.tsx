import React from 'react';
import { IPreferencesModel } from '../../models/PreferencesModel';
import { IPyramidNetPluginModel } from '../../models/PyramidNetMakerStore';
import { boundingViewBoxAttrs } from '../../../../common/util/svg';
import { RawSvgComponentProps } from '../../models/WorkspaceModel';

export const PyramidNetTestTabs = ({
  widgetStore, preferencesStore,
}: RawSvgComponentProps) => {
  // TODO: is the double-conversion here and elsewhere necessary?
  const { scoreProps, cutProps } = preferencesStore as unknown as IPreferencesModel;
  const { pyramidNetSpec: { testAscendantTab, testBaseTab } } = widgetStore as unknown as IPyramidNetPluginModel;
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
  return (
    <>
      {tabs.reduce((acc, { id, paths }) => {
        // TODO: the boundingViewBoxAttrs doesn't calculate path region property (seems to include control points),
        // thus items are improperly spaced
        const { ymin, ymax } = boundingViewBoxAttrs(paths.cut.getD());
        acc.y += -1 * ymin;
        acc.children.push((
          <g transform={`translate(0, ${acc.y})`} key={id} id={id}>
            <path className="score" {...scoreProps} d={paths.score.getD()} />
            <path className="cut" {...cutProps} d={paths.cut.getD()} />
          </g>
        ));
        acc.y += ymax + Y_SPACING;
        return acc;
      }, { children: [], y: 0 }).children}
    </>
  );
};
