/* eslint-disable max-classes-per-file,no-param-reassign */
import {
  Instance, types, tryResolve,
} from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import { polyhedra } from '../data/polyhedra';
import { PyramidNetModel } from './PyramidNetStore';
import { closedPolygonPath } from '../util/shapes/generic';
import { boundingViewBoxAttrs, pathDToViewBoxStr } from '../../../common/util/svg';
import { dashPatterns, DashPatternsModel } from '../data/dash-patterns';
import { EVENTS } from '../../../main/ipc';
import { UndoManagerWithGroupState } from '../../common/components/UndoManagerWithGroupState';
import { PyramidNetTestTabs } from '../widgets/PyramidNetTestTabs/PyramidNetTestTabsSvg';
import { SVGWrapper } from '../data/SVGWrapper';

export const DecorationBoundarySVG = ({ store }: { store: IPyramidNetFactoryModel }) => {
  const {
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
  pyramidNetSpec: types.optional(PyramidNetModel, {}),
  polyhedraPyramidGeometries: types.frozen(polyhedra),
  dashPatterns: types.optional(DashPatternsModel, dashPatterns),
  // TODO: make a prototype with history as property and use on all undoable models
  history: types.optional(UndoManagerWithGroupState, {}),
}).views((self) => ({
  get shapeDefinition() {
    return self.pyramidNetSpec;
  },

  get fitToCanvasTranslationStr() {
    const { xmin, ymin } = boundingViewBoxAttrs(self.pyramidNetSpec.netPaths.cut.getD());
    return `translate(${-xmin}, ${-ymin})`;
  },
})).actions((self) => ({
  sendShapeUpdate() {
    // @ts-ignore
    self.pyramidNetSpec.sendTextureUpdate();
    self.pyramidNetSpec.sendTextureBorderData();
  },
  renderDecorationBoundaryToString():string {
    // @ts-ignore
    return ReactDOMServer.renderToString(React.createElement(DecorationBoundarySVG, { store: self }));
  },

  renderTestTabsToString(widgetStore, preferencesStore): string {
    // @ts-ignore
    return ReactDOMServer.renderToString(
      <SVGWrapper>
        <PyramidNetTestTabs preferencesStore={preferencesStore} widgetStore={widgetStore} />
      </SVGWrapper>,
    );
  },

  getFileBasename() {
    return `${
      tryResolve(self, '/pyramidNetSpec/pyramid/shapeName') || 'shape'
    }__${
      tryResolve(self, '/pyramidNetSpec/faceDecoration/pattern/sourceFileName') || 'undecorated'
    }`;
  },
})).actions((self) => {
  const updateDielineHandler = (e, faceDecoration) => {
    self.pyramidNetSpec.setTextureFaceDecoration(faceDecoration);
  };
  const sendShapeUpdateHandler = () => { self.sendShapeUpdate(); };
  const updateShapeHandler = (_, shapeName) => { self.pyramidNetSpec.setPyramidShapeName(shapeName); }

  return {
    afterCreate() {
      globalThis.ipcRenderer.on(EVENTS.REQUEST_SHAPE_UPDATE, sendShapeUpdateHandler);
      globalThis.ipcRenderer.on(EVENTS.UPDATE_DIELINE_VIEWER, updateDielineHandler);
      globalThis.ipcRenderer.on(EVENTS.REQUEST_SHAPE_CHANGE, updateShapeHandler);
    },
    beforeDestroy() {
      globalThis.ipcRenderer.removeListener(EVENTS.UPDATE_DIELINE_VIEWER, updateDielineHandler);
      globalThis.ipcRenderer.removeListener(EVENTS.REQUEST_SHAPE_UPDATE, updateDielineHandler);
      globalThis.ipcRenderer.removeListener(EVENTS.REQUEST_SHAPE_CHANGE, updateShapeHandler);
    },
  };
});

export interface IPyramidNetFactoryModel extends Instance<typeof PyramidNetFactoryModel> {}
