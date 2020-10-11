/* eslint-disable max-classes-per-file,no-param-reassign */
import { set } from 'lodash';
import { types, Instance } from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import {
  FaceBoundarySVG, PyramidNet,
} from '../components/PyramidNet';
import { CM_TO_PIXELS_RATIO } from '../../common/util/geom';
import { polyhedra } from './polyhedra';
import { SVGWrapper } from './SVGWrapper';
import { PyramidNetModel } from './PyramidNetStore';

const defaultModelData:IPyramidNetFactoryModel = {
  styleSpec: {
    dieLineProps: { fill: 'none', strokeWidth: 1 },
    cutLineProps: { stroke: '#FF3A5E' },
    scoreLineProps: { stroke: '#BDFF48' },
    designBoundaryProps: { stroke: 'none', fill: 'rgb(68,154,255)' },
  },
  pyramidNetSpec: {
    pyramidGeometryId: 'small-triambic-icosahedron',
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

const PyramidNetFactoryModel = types.model({
  pyramidNetSpec: PyramidNetModel,
  polyhedraPyramidGeometries: types.frozen(polyhedra),
  svgDimensions: types.frozen({ width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 }),
  styleSpec: types.model({
    dieLineProps: types.model({
      fill: types.string,
      strokeWidth: types.number,
    }),
    cutLineProps: types.model({
      stroke: types.string,
    }),
    scoreLineProps: types.model({
      stroke: types.string,
    }),
    designBoundaryProps: types.model({
      stroke: types.string,
      fill: types.string,
    }),
  }),

}).actions((self) => ({
  // afterCreate() {
  //   Object.assign(self, defaultModelData);
  // },

  renderFaceBoundaryToString():string {
    // @ts-ignore
    return ReactDOMServer.renderToString(React.createElement(FaceBoundarySVG, { store: self }));
  },

  renderPyramidNetToString() {
    return ReactDOMServer.renderToString(React.createElement(
      // @ts-ignore
      SVGWrapper, self.svgDimensions, React.createElement(PyramidNet, { store: self }),
    ));
  },

  setValueAtPath(path: string, value: any) {
    set(self, path, value);
  },
}));

export interface IPyramidNetFactoryModel extends Instance<typeof PyramidNetFactoryModel> {}

export const store = PyramidNetFactoryModel.create(defaultModelData);

// @ts-ignore
window.store = store;
