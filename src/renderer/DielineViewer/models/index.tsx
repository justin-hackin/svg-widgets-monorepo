import React, { createContext, useContext } from 'react';
import { connectReduxDevtools } from 'mst-middlewares';
import { persist } from 'mst-persist';
import makeInspectable from 'mobx-devtools-mst';
// only used in dev build hence lint squelch
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';

import { unprotect } from 'mobx-state-tree';
// eslint-disable-next-line import/no-cycle
import { IPyramidNetFactoryModel, PyramidNetFactoryModel } from './PyramidNetMakerStore';
import { dashPatterns } from '../data/dash-patterns';
import { IPreferencesModel, PreferencesModel } from './PreferencesModel';

export const defaultModelData = {
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
const pyramidNetFactoryStore = PyramidNetFactoryModel.create(defaultModelData);
const NetFactoryStoreContext = createContext<IPyramidNetFactoryModel>(pyramidNetFactoryStore);

export const { Provider: PyramidNetFactoryProvider } = NetFactoryStoreContext;

export const PyramidNetFactoryStoreProvider = ({ children }) => (
  <PyramidNetFactoryProvider value={pyramidNetFactoryStore}>{children}</PyramidNetFactoryProvider>
);

export function usePyramidNetFactoryMst() {
  return useContext(NetFactoryStoreContext);
}

export const preferencesStore = PreferencesModel.create();
const PreferencesStoreContext = createContext<IPreferencesModel>(preferencesStore);
export const { Provider: PreferencesProvider } = PreferencesStoreContext;

export const PreferencesStoreProvider = ({ children }) => (
  <PreferencesProvider value={preferencesStore}>{children}</PreferencesProvider>
);

export function usePreferencesMst() {
  return useContext(PreferencesStoreContext);
}

if (process.env.NODE_ENV !== 'production') {
  connectReduxDevtools(remotedev, preferencesStore);
  connectReduxDevtools(remotedev, pyramidNetFactoryStore);
  makeInspectable(preferencesStore);
  makeInspectable(pyramidNetFactoryStore);
}
unprotect(pyramidNetFactoryStore);
unprotect(preferencesStore);
persist('preferencesStoreLocal', preferencesStore);
