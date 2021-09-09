/* eslint-disable max-classes-per-file,no-param-reassign */
import {
  Instance, types, tryResolve, applySnapshot, getSnapshot,
} from 'mobx-state-tree';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import { polyhedra } from '../data/polyhedra';
import { PyramidNetModel } from './PyramidNetStore';
import { closedPolygonPath } from '../util/shapes/generic';
import { getBoundingBoxAttrs, pathDToViewBoxStr } from '../../../common/util/svg';
import { dashPatterns, DashPatternsModel } from '../data/dash-patterns';
import { PyramidNetTestTabs } from '../widgets/PyramidNetTestTabs/PyramidNetTestTabsSvg';
import { SVGWrapper } from '../data/SVGWrapper';
import { TextureEditorModel } from '../../../common/components/TextureEditor/models/TextureEditorModel';
import { ITextureFaceDecorationModel } from './TextureFaceDecorationModel';

export const DecorationBoundarySVG = ({ store }: { store: IPyramidNetPluginModel }) => {
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

export const PyramidNetPluginModel = types.model('PyramidNetFactory', {
  pyramidNetSpec: types.optional(PyramidNetModel, {}),
  textureEditor: types.optional(TextureEditorModel, {}),
}).volatile(() => ({
  textureEditorOpen: false,
  dashPatterns: DashPatternsModel.create(dashPatterns),
  polyhedraPyramidGeometries: polyhedra,
}))
  .views((self) => ({
    get shapeDefinition() {
      return self.pyramidNetSpec;
    },

    get boundingBox() {
      return getBoundingBoxAttrs(self.pyramidNetSpec.netPaths.cut.getD());
    },
  })).actions((self) => ({
    setTextureEditorOpen(isOpen) {
      self.textureEditorOpen = isOpen;
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
    onFileOpen(filePath, fileData) {
      applySnapshot(self.pyramidNetSpec, fileData);
      // @ts-ignore
      const textureIsFromTextureEditor = (obj: unknown): obj is ITextureFaceDecorationModel => !!obj.transformOrigin;
      const shouldUpdateTextureEditor = self.pyramidNetSpec.faceDecoration
      && textureIsFromTextureEditor(self.pyramidNetSpec.faceDecoration);
      if (shouldUpdateTextureEditor) {
        self.textureEditor.setTexture(getSnapshot(self.pyramidNetSpec.faceDecoration));
      }
    },
  }));

export interface IPyramidNetPluginModel extends Instance<typeof PyramidNetPluginModel> {}
