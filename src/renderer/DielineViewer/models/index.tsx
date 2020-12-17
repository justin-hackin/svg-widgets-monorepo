import { dashPatterns } from '../data/dash-patterns';

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
    shapeHeightInCm: 20,
  },
};
