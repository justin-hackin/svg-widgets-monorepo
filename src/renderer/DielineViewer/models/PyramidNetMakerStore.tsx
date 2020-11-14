/* eslint-disable max-classes-per-file,no-param-reassign */
import { set } from 'lodash';
import { Instance, types, tryResolve } from 'mobx-state-tree';
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
import { EVENTS } from '../../../main/ipc';

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
}).actions((self) => ({
  sendShapeUpdate() {
    // @ts-ignore
    self.pyramidNetSpec.sendTextureUpdate();
    self.pyramidNetSpec.sendTextureBorderData();
  },
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
  getFileBasename() {
    return `${
      tryResolve(self, '/pyramidNetSpec/pyramid/shapeName') || 'shape'
    }__${
      tryResolve(self, '/texture/sourceFileName') || 'undecorated'
    }`;
  },
})).actions((self) => {
  const updateDielineHandler = (e, faceDecoration) => { self.pyramidNetSpec.setFaceDecoration(faceDecoration); };
  const sendShapeUpdateHandler = () => { self.sendShapeUpdate(); };

  return {
    afterCreate() {
      globalThis.ipcRenderer.on(EVENTS.REQUEST_SHAPE_UPDATE, sendShapeUpdateHandler);
      globalThis.ipcRenderer.on(EVENTS.UPDATE_DIELINE_VIEWER, updateDielineHandler);
    },
    beforeDestroy() {
      globalThis.ipcRenderer.removeListener(EVENTS.UPDATE_DIELINE_VIEWER, updateDielineHandler);
      globalThis.ipcRenderer.removeListener(EVENTS.REQUEST_SHAPE_UPDATE, updateDielineHandler);
    },
  };
});

export interface IPyramidNetFactoryModel extends Instance<typeof PyramidNetFactoryModel> {}
