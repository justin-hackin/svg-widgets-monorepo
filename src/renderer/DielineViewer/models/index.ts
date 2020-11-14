import { createContext, useContext } from 'react';
import { connectReduxDevtools } from 'mst-middlewares';
import makeInspectable from 'mobx-devtools-mst';
// only used in dev build hence lint squelch
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';

// eslint-disable-next-line import/no-cycle
import { unprotect } from 'mobx-state-tree';
import { IPyramidNetFactoryModel, PyramidNetFactoryModel } from './PyramidNetMakerStore';
import { dashPatterns } from '../data/dash-patterns';

export const defaultModelData = {
  styleSpec: {
    dieLineProps: { fill: 'none', strokeWidth: 1 },
    cutLineProps: { stroke: '#FF3A5E' },
    scoreLineProps: { stroke: '#BDFF48' },
    designBoundaryProps: { stroke: 'none', fill: 'rgb(68,154,255)' },
  },
  dashPatterns,
  pyramidNetSpec: {
    // @ts-ignore
    pyramid: { shapeName: 'small-triambic-icosahedron' },
    ascendantEdgeTabsSpec: {
      flapRoundingDistanceRatio: 1,
      holeFlapTaperAngle: 0.3141592653589793,
      holeReachToTabDepth: 0.1,
      holeWidthRatio: 0.4,
      midpointDepthToTabDepth: 0.5,
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
      tabDepthToAscendantTabDepth: 1.5,
      bendGuideValley: {
        depthRatio: 0.5,
        theta: Math.PI / 4,
      },
    },
    // @ts-ignore
    useDottedStroke: false,
    shapeHeightInCm: 40,
  },
};
export const netFactoryStore = PyramidNetFactoryModel.create(defaultModelData);
if (process.env.NODE_ENV !== 'production') {
  connectReduxDevtools(remotedev, netFactoryStore);
  makeInspectable(netFactoryStore);
  unprotect(netFactoryStore);
}
const NetFactoryStoreContext = createContext<IPyramidNetFactoryModel>(netFactoryStore);

export const { Provider } = NetFactoryStoreContext;

export function useMst() {
  const store = useContext(NetFactoryStoreContext);
  return store;
}
