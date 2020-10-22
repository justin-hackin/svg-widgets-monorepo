import { createContext, useContext } from 'react';
import makeInspectable from 'mobx-devtools-mst';

import { IPyramidNetFactoryModel, PyramidNetFactoryModel } from './PyramidNetMakerStore';

const defaultModelData: IPyramidNetFactoryModel = {
  styleSpec: {
    dieLineProps: { fill: 'none', strokeWidth: 1 },
    cutLineProps: { stroke: '#FF3A5E' },
    scoreLineProps: { stroke: '#BDFF48' },
    designBoundaryProps: { stroke: 'none', fill: 'rgb(68,154,255)' },
  },
  pyramidNetSpec: {
    // @ts-ignore
    pyramid: { shapeName: 'small-triambic-icosahedron' },
    ascendantEdgeTabsSpec: {
      flapRoundingDistanceRatio: 1,
      holeFlapTaperAngle: 0.3141592653589793,
      holeReachToTabDepth: 0.1,
      holeWidthRatio: 0.4,
      midpointDepthToTabDepth: 0.64527027,
      tabDepthToTraversalLength: 0.04810606060599847,
      tabRoundingDistanceRatio: 0.75,
      tabStartGapToTabDepth: 1,
      tabWideningAngle: 0.19634954084936207,
      tabsCount: 3,
    },
    baseEdgeTabsSpec: {
      finDepthToTabDepth: 1.1,
      finOffsetRatio: 0.75,
      holeBreadthToHalfWidth: 0.25,
      holeDepthToTabDepth: 0.5,
      holeTaper: 0.6981317007977318,
      tabDepthToAscendantEdgeLength: 1.5,
    },
    // @ts-ignore
    baseScoreDashSpec: {
      strokeDashPathPatternId: 'base',
      strokeDashLength: 11,
      strokeDashOffsetRatio: 0,
    },
    // @ts-ignore
    interFaceScoreDashSpec: {
      strokeDashPathPatternId: 'base',
      strokeDashLength: 11,
      strokeDashOffsetRatio: 0,
    },
    shapeHeightInCm: 40,
  },
};
export const netFactoryStore = PyramidNetFactoryModel.create(defaultModelData);
makeInspectable(netFactoryStore);
const NetFactoryStoreContext = createContext<IPyramidNetFactoryModel>(netFactoryStore);

export const { Provider } = NetFactoryStoreContext;

export function useMst() {
  const store = useContext(NetFactoryStoreContext);
  return store;
}
