/* eslint-disable max-classes-per-file,no-param-reassign */
import { set } from 'lodash';
import { Instance, types } from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { UndoManager } from 'mst-middlewares';

// eslint-disable-next-line import/no-cycle
import { PyramidNet } from '../components/PyramidNet';
import { CM_TO_PIXELS_RATIO } from '../../common/util/geom';
import { polyhedra } from '../data/polyhedra';
import { SVGWrapper } from '../data/SVGWrapper';
import { PyramidNetModel } from './PyramidNetStore';
import { closedPolygonPath } from '../util/shapes/generic';
import { pathDToViewBoxStr } from '../../../common/util/svg';
import { DashPatternsModel } from '../data/dash-patterns';

export const DecorationBoundarySVG = ({ store }: { store: IPyramidNetFactoryModel }) => {
  const {
    // @ts-ignore
    pyramidNetSpec: { normalizedDecorationBoundaryPoints },
  } = store;
  const normalizedDecorationBoundaryPathD = closedPolygonPath(normalizedDecorationBoundaryPoints).getD();

  return (
    <svg viewBox={pathDToViewBoxStr(normalizedDecorationBoundaryPathD)}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPathD} />
    </svg>
  );
};

export const PyramidNetFactoryModel = types.model('PyramidNetFactory', {
  pyramidNetSpec: types.maybe(types.late(() => PyramidNetModel)),
  polyhedraPyramidGeometries: types.frozen(polyhedra),
  dashPatterns: DashPatternsModel,
  svgDimensions: types.frozen({ width: CM_TO_PIXELS_RATIO * 49.5, height: CM_TO_PIXELS_RATIO * 27.9 }),
  history: types.optional(UndoManager, {}),
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
  renderDecorationBoundaryToString():string {
    // @ts-ignore
    return ReactDOMServer.renderToString(React.createElement(DecorationBoundarySVG, { store: self }));
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
